import { NextRequest, NextResponse } from "next/server";
import { generateAssignmentSections, ParseError } from "@/lib/gemini";
import {
  buildAssignmentDocxBuffer,
  sanitizeFilenamePart,
  type CoverPageFields,
} from "@/lib/docx-builder";
import { getRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

type GenerateBody = {
  studentName?: unknown;
  sapId?: unknown;
  section?: unknown;
  submittedTo?: unknown;
  subject?: unknown;
  assignmentNumber?: unknown;
  assignmentTitle?: unknown;
  instructions?: unknown;
  wordCount?: unknown;
};

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) {
      return first.trim();
    }
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function validateBody(body: GenerateBody): {
  ok: true;
  data: {
    cover: CoverPageFields;
    assignmentNumber: number;
    instructions: string;
    wordCount: number;
  };
} | { ok: false; message: string } {
  if (!isNonEmptyString(body.studentName)) {
    return { ok: false, message: "Student name is required." };
  }
  if (!isNonEmptyString(body.sapId)) {
    return { ok: false, message: "SAP ID is required." };
  }
  const sapDigits = String(body.sapId).replace(/\D/g, "");
  if (sapDigits.length !== 8) {
    return { ok: false, message: "SAP ID must be exactly 8 digits." };
  }
  if (!isNonEmptyString(body.section)) {
    return { ok: false, message: "Section is required." };
  }
  if (!isNonEmptyString(body.submittedTo)) {
    return { ok: false, message: "Submitted To / Teacher name is required." };
  }
  if (!isNonEmptyString(body.subject)) {
    return { ok: false, message: "Subject is required." };
  }
  const an = body.assignmentNumber;
  if (typeof an !== "number" || !Number.isFinite(an) || an < 1) {
    return { ok: false, message: "Assignment number must be a positive number." };
  }
  if (!isNonEmptyString(body.instructions)) {
    return { ok: false, message: "Assignment instructions / topic is required." };
  }
  const wc = body.wordCount;
  const allowed = [500, 800, 1000, 1500];
  if (typeof wc !== "number" || !allowed.includes(wc)) {
    return {
      ok: false,
      message: "Word count target must be one of 500, 800, 1000, or 1500.",
    };
  }
  let assignmentTitle: string | undefined;
  if (body.assignmentTitle !== undefined && body.assignmentTitle !== null) {
    if (typeof body.assignmentTitle !== "string") {
      return { ok: false, message: "Assignment title must be text." };
    }
    const t = body.assignmentTitle.trim();
    if (t.length > 0) {
      assignmentTitle = t;
    }
  }

  return {
    ok: true,
    data: {
      cover: {
        studentName: body.studentName.trim(),
        sapId: sapDigits,
        section: body.section.trim(),
        submittedTo: body.submittedTo.trim(),
        subject: body.subject.trim(),
        assignmentTitle,
      },
      assignmentNumber: Math.floor(an),
      instructions: body.instructions.trim(),
      wordCount: wc,
    },
  };
}

export async function POST(req: NextRequest) {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateBody(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.message }, { status: 400 });
  }

  const ip = getClientIp(req);
  try {
    const limiter = getRateLimiter();
    const { success } = await limiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        {
          error: "You've hit the rate limit. Try again in an hour.",
        },
        { status: 429 },
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Rate limit configuration error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { cover, assignmentNumber, instructions, wordCount } = validated.data;

  let sections;
  try {
    sections = await generateAssignmentSections({
      studentName: cover.studentName,
      sapId: cover.sapId,
      section: cover.section,
      submittedTo: cover.submittedTo,
      subject: cover.subject,
      assignmentNumber,
      assignmentTitle: cover.assignmentTitle,
      instructions,
      wordCount,
    });
  } catch (e) {
    if (e instanceof ParseError) {
      return NextResponse.json(
        { error: "AI returned an unexpected response, please try again" },
        { status: 500 },
      );
    }
    const message = e instanceof Error ? e.message : String(e);

    if (message.includes("503") || message.toLowerCase().includes("high demand")) {
      return NextResponse.json(
        { error: "The AI model is currently experiencing high demand. Please try again after some time." },
        { status: 503 },
      );
    } else if (message.includes("[GoogleGenerativeAI Error]")) {
      return NextResponse.json(
        { error: "The AI service encountered a temporary error. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: "An unexpected error occurred during generation. Please try again." }, { status: 500 });
  }

  let buffer: Buffer;
  try {
    buffer = await buildAssignmentDocxBuffer({
      cover,
      assignmentNumber,
      sections,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to build document. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const subj = sanitizeFilenamePart(cover.subject);
  const num = String(assignmentNumber);
  const filename = `Assignment_${subj}_${num}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

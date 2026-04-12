import { GoogleGenerativeAI } from "@google/generative-ai";

/** Stable model for generateContent; override with GEMINI_MODEL if Google renames endpoints. */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export interface AssignmentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

const SYSTEM_PROMPT = `You are an academic writing assistant for University of Lahore students.
Generate a complete, well-structured assignment based on the topic and instructions provided.

Return ONLY a valid JSON array. No preamble, no markdown, no backticks. Raw JSON only.

Each element in the array is a section object with this shape:
{
  "heading": "Section Title",
  "paragraphs": ["paragraph one text", "paragraph two text"],
  "bullets": ["optional bullet point", "another bullet"]
}

Rules:
- "bullets" key is optional — only include it if the section genuinely benefits from a list
- Write in clear, simple academic English suitable for a university student
- Target approximately {wordCount} words total across all sections
- Be factually accurate and directly answer the assignment instructions
- Include at least 4 sections: Introduction, [2-3 topic-specific body sections], Conclusion
- Do not include cover page fields in the content
- Return raw JSON array only — nothing else`;

function buildUserPrompt(params: {
  studentName: string;
  sapId: string;
  section: string;
  submittedTo: string;
  subject: string;
  assignmentNumber: number;
  assignmentTitle: string | undefined;
  instructions: string;
  wordCount: number;
}): string {
  const titleLine = params.assignmentTitle
    ? `Assignment title (optional): ${params.assignmentTitle}\n`
    : "";
  return `Generate the assignment body content as specified.

Context (do NOT repeat these in the JSON — for your understanding only):
- Student: ${params.studentName}, SAP: ${params.sapId}, Section: ${params.section}
- Submitted to: ${params.submittedTo}
- Subject: ${params.subject}
- Assignment number: ${params.assignmentNumber}
${titleLine}
Assignment instructions / topic:
${params.instructions}

Word count target: approximately ${params.wordCount} words total.`;
}

export async function generateAssignmentSections(params: {
  studentName: string;
  sapId: string;
  section: string;
  submittedTo: string;
  subject: string;
  assignmentNumber: number;
  assignmentTitle: string | undefined;
  instructions: string;
  wordCount: number;
}): Promise<AssignmentSection[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(key);
  const modelId =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: SYSTEM_PROMPT.replace(
      "{wordCount}",
      String(params.wordCount),
    ),
  });

  const result = await model.generateContent(buildUserPrompt(params));
  const text = result.response.text();
  return parseAssignmentJson(text);
}

function stripJsonFences(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    const firstNl = t.indexOf("\n");
    if (firstNl !== -1) {
      t = t.slice(firstNl + 1);
    }
    const endFence = t.lastIndexOf("```");
    if (endFence !== -1) {
      t = t.slice(0, endFence);
    }
  }
  return t.trim();
}

function parseAssignmentJson(text: string): AssignmentSection[] {
  const cleaned = stripJsonFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned) as unknown;
  } catch {
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) {
      throw new ParseError();
    }
    try {
      parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    } catch {
      throw new ParseError();
    }
  }
  if (!Array.isArray(parsed)) {
    throw new ParseError();
  }
  const out: AssignmentSection[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      throw new ParseError();
    }
    const o = item as Record<string, unknown>;
    if (typeof o.heading !== "string" || !Array.isArray(o.paragraphs)) {
      throw new ParseError();
    }
    const paragraphs = o.paragraphs.filter(
      (p): p is string => typeof p === "string",
    );
    if (paragraphs.length === 0) {
      throw new ParseError();
    }
    let bullets: string[] | undefined;
    if (o.bullets !== undefined) {
      if (!Array.isArray(o.bullets)) {
        throw new ParseError();
      }
      const bs = o.bullets.filter((b): b is string => typeof b === "string");
      if (bs.length > 0) {
        bullets = bs;
      }
    }
    out.push({ heading: o.heading, paragraphs, bullets });
  }
  if (out.length === 0) {
    throw new ParseError();
  }
  return out;
}

export class ParseError extends Error {
  constructor() {
    super("PARSE_ERROR");
    this.name = "ParseError";
  }
}

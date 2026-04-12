import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  SectionType,
  TextRun,
  ImageRun,
  HorizontalPositionAlign,
  VerticalPositionRelativeFrom,
  HorizontalPositionRelativeFrom,
  TextWrappingType,
} from "docx";
import type { AssignmentSection } from "./gemini";
import { UOL_LOGO_B64 } from "./uol-logo-b64";

export { UOL_LOGO_B64 };

// Decode the logo
const UOL_LOGO_BUFFER = Buffer.from(UOL_LOGO_B64, "base64");

export type CoverPageFields = {
  studentName: string;
  sapId: string;
  section: string;
  submittedTo: string;
  subject: string;
  assignmentTitle?: string;
};

/**
 * Build the University of Lahore standard cover page section.
 * @param fields
 * @param fields.studentName
 * @param fields.sapId
 * @param fields.section
 * @param fields.submittedTo
 * @param fields.subject
 * @param fields.assignmentTitle  — optional purple title row
 * @returns docx-js section object (pass directly into Document sections array)
 */
export function buildCoverPageSection(fields: CoverPageFields) {
  const cascadia = { font: "Cascadia Code" };
  const sz40 = { size: 40, bold: true, ...cascadia };

  // Helper: green label paragraph
  const labelPara = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, color: "00B050", ...sz40 })],
      spacing: { line: 360, lineRule: "auto" },
    });

  // Helper: blue value paragraph (tab-indented)
  const valuePara = (text: string) =>
    new Paragraph({
      children: [
        new TextRun({ text: "\t", color: "4472C4", ...sz40 }),
        new TextRun({ text, color: "4472C4", ...sz40 }),
      ],
      spacing: { line: 360, lineRule: "auto" },
    });

  const children = [
    // --- Logo (centered, floating anchor) ---
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          type: "png",
          data: UOL_LOGO_BUFFER,
          transformation: { width: 260, height: 94 }, // ~3460750 × 1254760 EMUs
          floating: {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.MARGIN,
              align: HorizontalPositionAlign.CENTER,
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.PAGE,
              offset: 527050,
            },
            wrap: { type: TextWrappingType.SQUARE, side: "bothSides" },
            allowOverlap: true,
          },
          altText: {
            title: "UoL Logo",
            description: "University of Lahore Logo",
            name: "UoLLogo",
          },
        }),
      ],
    }),

    // Spacer paragraphs (replicate original blank lines after logo)
    new Paragraph({ children: [], spacing: { line: 360, lineRule: "auto" } }),
    new Paragraph({ children: [], spacing: { line: 360, lineRule: "auto" } }),
    new Paragraph({ children: [], spacing: { line: 360, lineRule: "auto" } }),

    // --- Optional assignment title (purple) ---
    ...(fields.assignmentTitle
      ? [
          new Paragraph({
            children: [
              new TextRun({
                text: fields.assignmentTitle,
                color: "7030A0",
                size: 40,
                bold: true,
                ...cascadia,
              }),
            ],
            spacing: { line: 360, lineRule: "auto" },
          }),
        ]
      : []),

    // --- Fields ---
    labelPara("Name:"),
    valuePara(fields.studentName),
    labelPara("Sap ID:"),
    valuePara(fields.sapId),
    labelPara("Section:"),
    valuePara(fields.section),
    labelPara("Submitted To:"),
    valuePara(fields.submittedTo),
    labelPara("Subject:"),
    valuePara(fields.subject),

    // --- Separator line ---
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 12,
          color: "auto",
          space: 1,
        },
      },
      children: [],
    }),

    // Trailing blank paragraph before section break
    new Paragraph({ children: [] }),
  ];

  return {
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        borders: {
          pageBorderTop: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: "4472C4",
            space: 24,
          },
          pageBorderBottom: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: "4472C4",
            space: 24,
          },
          pageBorderLeft: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: "4472C4",
            space: 24,
          },
          pageBorderRight: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: "4472C4",
            space: 24,
          },
        },
      },
    },
    children,
  };
}

function splitTextRuns(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      line: 276,
      lineRule: "auto",
      after: 160,
    },
    children: [
      new TextRun({
        text,
        font: "Arial",
        size: 24,
      }),
    ],
  });
}

export async function buildAssignmentDocxBuffer(params: {
  cover: CoverPageFields;
  assignmentNumber: number;
  sections: AssignmentSection[];
}): Promise<Buffer> {
  const { cover, assignmentNumber, sections } = params;

  const bulletConfigs: Array<{
    reference: string;
    levels: Array<{
      level: number;
      format: (typeof LevelFormat)[keyof typeof LevelFormat];
      text: string;
      alignment: (typeof AlignmentType)[keyof typeof AlignmentType];
      style: {
        paragraph: {
          indent: { left: number; hanging: number };
        };
      };
    }>;
  }> = [];

  sections.forEach((sec, index) => {
    if (sec.bullets && sec.bullets.length > 0) {
      bulletConfigs.push({
        reference: `assignment-bullets-${index}`,
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 },
              },
            },
          },
        ],
      });
    }
  });

  const contentChildren: Paragraph[] = [];

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    contentChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: sec.heading,
            font: "Arial",
            bold: true,
            size: 32,
            color: "2E4057",
          }),
        ],
      }),
    );

    for (const p of sec.paragraphs) {
      for (const chunk of splitTextRuns(p)) {
        contentChildren.push(bodyParagraph(chunk));
      }
    }

    if (sec.bullets && sec.bullets.length > 0) {
      const ref = `assignment-bullets-${i}`;
      for (const b of sec.bullets) {
        for (const chunk of splitTextRuns(b)) {
          contentChildren.push(
            new Paragraph({
              numbering: { reference: ref, level: 0 },
              spacing: {
                line: 276,
                lineRule: "auto",
                after: 160,
              },
              children: [
                new TextRun({
                  text: chunk,
                  font: "Arial",
                  size: 24,
                }),
              ],
            }),
          );
        }
      }
    }
  }

  const headerText = `${cover.subject} — Assignment ${assignmentNumber}`;

  const header = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: headerText,
            font: "Arial",
            size: 20,
            color: "888888",
          }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            font: "Arial",
            size: 20,
            children: [PageNumber.CURRENT],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    numbering:
      bulletConfigs.length > 0 ? { config: bulletConfigs } : undefined,
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 24,
          },
        },
      },
    },
    sections: [
      buildCoverPageSection(cover),
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: contentChildren,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function sanitizeFilenamePart(name: string): string {
  return name.replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "_").trim() || "Assignment";
}

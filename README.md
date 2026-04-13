# UoL Assignment Generator

A Next.js web application that generates AI-written, formatted university assignments for **University of Lahore** students. Fill in your student details, describe the topic, and download a ready-to-submit `.docx` file in seconds.

## Features

- **AI-generated content** — Uses Google Gemini to write a structured, academic assignment body (Introduction, topic-specific body sections, Conclusion).
- **Formatted DOCX output** — Downloads a `.docx` file with a branded cover page (UoL logo, student info) and well-structured body content.
- **Flexible word count** — Choose a target of 500, 800, 1000, or 1500 words.
- **Optional assignment title** — Displayed as a heading on the cover page.
- **Rate limiting** — 5 requests per IP per hour, backed by Upstash Redis.
- **Stateless & private** — No accounts, no database. API keys stay on the server.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | [Google Gemini](https://ai.google.dev/) (`@google/generative-ai`) |
| DOCX generation | [docx](https://github.com/dolanmiu/docx) |
| Rate limiting | [Upstash Ratelimit](https://upstash.com/) + Redis |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- An [Upstash Redis](https://upstash.com/) database (for rate limiting)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Legharihasham/Assasin.git
   cd Assasin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   GEMINI_API_KEY=your_google_gemini_api_key

   UPSTASH_REDIS_REST_URL=https://your-upstash-redis-url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

   # Optional: override the default Gemini model (default: gemini-2.5-flash)
   # GEMINI_MODEL=gemini-2.5-flash
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Fill in your **student details**: name, SAP ID (8 digits), section, and teacher name.
2. Enter the **subject** and **assignment number**.
3. Optionally provide an **assignment title** (shown as a heading on the cover page).
4. Select the **word count target** (500 / 800 / 1000 / 1500 words).
5. Describe the **assignment topic or paste the instructions** in the text area.
6. Click **Generate & download DOCX** — the file downloads automatically once ready.

> **Note:** AI can make mistakes. Review the generated content before submitting.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── app/
│   ├── api/generate/route.ts   # POST /api/generate — validates input, calls Gemini, returns DOCX
│   ├── page.tsx                # Main UI (form + download logic)
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── lib/
│   ├── gemini.ts               # Gemini AI integration & JSON parser
│   ├── docx-builder.ts         # DOCX file builder (cover page + body)
│   ├── rate-limit.ts           # Upstash rate limiter (5 req / 1 h / IP)
│   └── uol-logo-b64.ts         # Base64-encoded UoL logo for the cover page
├── scripts/                    # Utility scripts for logo extraction
└── next.config.mjs
```

## Rate Limiting

Each IP address is limited to **3 requests per hour**. If you exceed the limit, you will see an error message and need to wait before generating again.

## License

See [LICENSE](LICENSE) for details.

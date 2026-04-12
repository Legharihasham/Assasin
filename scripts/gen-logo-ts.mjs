import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const b64 = fs.readFileSync(path.join(root, "lib", "uol-logo-b64.txt"), "utf8").trim();
const out = `/** Auto-generated from SKILL.md — do not edit manually. Run: node scripts/gen-logo-ts.mjs */
export const UOL_LOGO_B64 = \`${b64}\`;
`;
fs.writeFileSync(path.join(root, "lib", "uol-logo-b64.ts"), out);
console.log("wrote lib/uol-logo-b64.ts", b64.length);

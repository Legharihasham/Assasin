import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const m = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
const marker = "const UOL_LOGO_B64 = `";
const i = m.indexOf(marker);
if (i < 0) throw new Error("marker not found");
const j = i + marker.length;
const k = m.indexOf("`", j);
const b64 = m.slice(j, k);
fs.mkdirSync(path.join(root, "lib"), { recursive: true });
fs.writeFileSync(path.join(root, "lib", "uol-logo-b64.txt"), b64);
console.log("wrote", b64.length);

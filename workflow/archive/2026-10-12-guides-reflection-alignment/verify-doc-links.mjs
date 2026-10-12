import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const files = [
  "docs/UserGuide.md",
  "docs/DeveloperGuide.md",
  "docs/PaulReflections.md",
  "docs/Reflections.md",
];
const failures = [];
let checked = 0;
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]/gu, "")
    .trim()
    .replace(/ /g, "-");
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^https?:\/\//.test(target)) continue;
    const [path, anchor] = target.split("#");
    const destination = path ? resolve(dirname(file), path) : resolve(file);
    if (!existsSync(destination)) {
      failures.push(`${file}: missing ${target}`);
      continue;
    }
    if (anchor && destination.endsWith(".md")) {
      const body = readFileSync(destination, "utf8").replace(
        /```[\s\S]*?```/g,
        "",
      );
      const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((item) =>
        slug(item[1]),
      );
      if (!headings.includes(decodeURIComponent(anchor)))
        failures.push(`${file}: missing heading ${target}`);
    }
    checked++;
  }
}
const reflection = readFileSync("docs/PaulReflections.md", "utf8");
const questions = [...reflection.matchAll(/^### /gm)].length;
if (questions !== 13)
  failures.push(`Paul reflection has ${questions} prompts, expected 13`);
const reflectionIndex = readFileSync("docs/Reflections.md", "utf8");
const paulEntry = reflectionIndex
  .split(/\r?\n/)
  .find((line) => line.includes("](PaulReflections.md)"));
if (
  !paulEntry?.includes("AI-assisted") ||
  !paulEntry.includes("personal verification") ||
  !paulEntry.includes("remains pending")
)
  failures.push("Personal verification status missing");
if (failures.length) {
  failures.forEach((value) => process.stderr.write(value + "\n"));
  process.exitCode = 1;
} else
  process.stdout.write(
    `Passed: ${checked} local guide/reflection links and anchors; 13 reflection prompts; personal verification remains pending.\n`,
  );

// Copies the pipeline's committed data into public/ so the raw numbers are downloadable
// straight from the site — no GitHub account, no API. Runs before dev and build.
// "Open for anyone to inspect" has to mean a real, working link.
import { mkdirSync, copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, "..", "..", "data");
const OUT = join(here, "..", "public", "data");

const files = [
  ["latest.json", join(DATA, "latest.json")],
  ["history/national.jsonl", join(DATA, "history", "national.jsonl")],
];

mkdirSync(join(OUT, "history"), { recursive: true });

let copied = 0;
for (const [rel, src] of files) {
  if (!existsSync(src)) {
    console.warn(`sync-data: source missing, skipping ${rel}`);
    continue;
  }
  copyFileSync(src, join(OUT, rel));
  copied++;
}

// A tiny manifest so the /data page and any consumer can discover what's here.
writeFileSync(
  join(OUT, "index.json"),
  JSON.stringify(
    {
      note: "Raw data behind India Judicial Pulse. Free to read, quote and reuse. Source: NJDG (eCourts).",
      files: {
        latest: "/data/latest.json",
        history: "/data/history/national.jsonl",
      },
      not_legal_evidence: true,
    },
    null,
    2
  ) + "\n"
);

console.log(`sync-data: exposed ${copied} data file(s) under public/data/`);

import { promises as fs } from "fs";
import path from "path";

/**
 * Dev-only source-matching helper.
 *
 * Given a literal string (e.g. an element's visible text), finds where —
 * if anywhere — it appears verbatim across the app's own `.tsx` source
 * tree. Used by lib/dev/site-comments.ts to make a best-effort guess at
 * which file a commented-on element lives in.
 *
 * Design constraint: never guess. A match is only useful if the string
 * appears in exactly one file, exactly once — anything else (not found,
 * or found in multiple places) is ambiguous, so callers should treat a
 * non-unique result as "unknown" rather than picking one arbitrarily.
 */

const PROJECT_ROOT = process.cwd();
const SCAN_DIRS = ["app", "components"];

export interface EditMatch {
  file: string;
  occurrences: number;
}

async function listSourceFiles(): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string) {
    let entries: import("fs").Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && fullPath.endsWith(".tsx")) {
        results.push(fullPath);
      }
    }
  }

  for (const dir of SCAN_DIRS) {
    await walk(path.join(PROJECT_ROOT, dir));
  }

  return results;
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = 0;
  while (true) {
    const found = haystack.indexOf(needle, index);
    if (found === -1) break;
    count += 1;
    index = found + needle.length;
  }
  return count;
}

export async function findEditMatches(oldValue: string): Promise<EditMatch[]> {
  const files = await listSourceFiles();
  const matches: EditMatch[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const occurrences = countOccurrences(content, oldValue);
    if (occurrences > 0) {
      matches.push({ file: path.relative(PROJECT_ROOT, file), occurrences });
    }
  }

  return matches;
}

import { promises as fs } from "fs";
import path from "path";
import { findEditMatches } from "@/lib/dev/edit-source";

/**
 * Dev-only "Edit Site" comment store.
 *
 * Comments left in the browser overlay persist here, in
 * `.claude/site-comments.json`, specifically so a separate coding-agent
 * session (not the browser) can read them straight off disk. This file is
 * a local working artifact — like `.next/` or `prisma/dev.db` — not app
 * content, so it's gitignored (see .gitignore) and never bundled into any
 * page. It intentionally is NOT the same store as an app database table:
 * comments are notes *about* the UI for an agent to act on, not product
 * data the app itself needs to render.
 */

const PROJECT_ROOT = process.cwd();
const COMMENTS_DIR = path.join(PROJECT_ROOT, ".claude");
const COMMENTS_FILE = path.join(COMMENTS_DIR, "site-comments.json");

export type CommentStatus = "open" | "resolved";

export interface SiteCommentTarget {
  tagName: string;
  /** Short visible text snippet from the element, for human identification. */
  textSnippet: string | null;
  /** The element's className string at the time the comment was left. */
  classList: string;
}

export interface SiteCommentSource {
  file: string;
  /** 1-based line number, if we could locate it; null if only the file was resolved. */
  line: number | null;
}

export interface SiteComment {
  id: number;
  timestamp: string;
  pathname: string;
  target: SiteCommentTarget;
  /** Best-effort resolved source location; null when ambiguous/not found. */
  sourceFile: SiteCommentSource | null;
  /** Normalized position (0-1 of document width/height) so the pin can be
   * replotted if the viewport size differs from when it was created. */
  position: { xRatio: number; yRatio: number };
  text: string;
  status: CommentStatus;
}

export interface NewCommentInput {
  pathname: string;
  target: SiteCommentTarget;
  position: { xRatio: number; yRatio: number };
  text: string;
}

function isDevEnvironment() {
  return process.env.NODE_ENV !== "production";
}

async function readAll(): Promise<SiteComment[]> {
  try {
    const raw = await fs.readFile(COMMENTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SiteComment[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeAll(comments: SiteComment[]): Promise<void> {
  await fs.mkdir(COMMENTS_DIR, { recursive: true });
  await fs.writeFile(
    COMMENTS_FILE,
    JSON.stringify(comments, null, 2) + "\n",
    "utf8",
  );
}

/**
 * Best-effort resolution of which source file (and, if the match is
 * single-line, which line) an element's visible text lives in. Reuses the
 * same exact-unique-string matching as the direct-edit tool: if the text
 * snippet isn't found, or is found in more than one place, we return null
 * rather than guess — a wrong pointer is worse than no pointer for a
 * coding agent acting on this later.
 */
export async function resolveSourceLocation(
  textSnippet: string | null,
): Promise<SiteCommentSource | null> {
  if (!textSnippet || textSnippet.trim().length === 0) {
    return null;
  }

  const matches = await findEditMatches(textSnippet);
  const totalOccurrences = matches.reduce((sum, m) => sum + m.occurrences, 0);

  if (matches.length !== 1 || totalOccurrences !== 1) {
    return null;
  }

  const [{ file }] = matches;
  const absolutePath = path.join(PROJECT_ROOT, file);

  let line: number | null = null;
  try {
    const content = await fs.readFile(absolutePath, "utf8");
    const index = content.indexOf(textSnippet);
    if (index !== -1) {
      line = content.slice(0, index).split("\n").length;
    }
  } catch {
    line = null;
  }

  return { file, line };
}

export async function listComments(): Promise<SiteComment[]> {
  if (!isDevEnvironment()) return [];
  return readAll();
}

export async function createComment(
  input: NewCommentInput,
): Promise<SiteComment> {
  if (!isDevEnvironment()) {
    throw new Error("Site comments are unavailable outside development.");
  }

  const comments = await readAll();
  const nextId =
    comments.length === 0 ? 1 : Math.max(...comments.map((c) => c.id)) + 1;

  const sourceFile = await resolveSourceLocation(input.target.textSnippet);

  const comment: SiteComment = {
    id: nextId,
    timestamp: new Date().toISOString(),
    pathname: input.pathname,
    target: input.target,
    sourceFile,
    position: input.position,
    text: input.text,
    status: "open",
  };

  comments.push(comment);
  await writeAll(comments);

  return comment;
}

export async function updateCommentStatus(
  id: number,
  status: CommentStatus,
): Promise<SiteComment | null> {
  if (!isDevEnvironment()) {
    throw new Error("Site comments are unavailable outside development.");
  }

  const comments = await readAll();
  const index = comments.findIndex((c) => c.id === id);
  if (index === -1) return null;

  comments[index] = { ...comments[index], status };
  await writeAll(comments);

  return comments[index];
}

export async function deleteComment(id: number): Promise<boolean> {
  if (!isDevEnvironment()) {
    throw new Error("Site comments are unavailable outside development.");
  }

  const comments = await readAll();
  const next = comments.filter((c) => c.id !== id);
  if (next.length === comments.length) return false;

  await writeAll(next);
  return true;
}

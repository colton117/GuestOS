import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import type { LogLevel, Prisma } from "@prisma/client";

/**
 * Every event also gets appended to `.claude/system-log.jsonl` (dev only),
 * mirroring the site-comments.json pattern: a coding-agent session can Read
 * this file directly to see recent host/admin actions and system errors
 * without starting the dev server or querying Postgres. It's a rolling
 * window (MAX_JSONL_LINES), not a full history — the database is the
 * source of truth and is what the /logs page renders.
 */
const PROJECT_ROOT = process.cwd();
const LOG_FILE = path.join(PROJECT_ROOT, ".claude", "system-log.jsonl");
const MAX_JSONL_LINES = 500;

function isDevEnvironment() {
  return process.env.NODE_ENV !== "production";
}

async function appendToJsonlFile(record: Record<string, unknown>) {
  if (!isDevEnvironment()) return;

  try {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });

    let existingLines: string[] = [];
    try {
      const existing = await fs.readFile(LOG_FILE, "utf8");
      existingLines = existing.split("\n").filter(Boolean);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    const nextLines = [...existingLines, JSON.stringify(record)].slice(
      -MAX_JSONL_LINES,
    );
    await fs.writeFile(LOG_FILE, nextLines.join("\n") + "\n", "utf8");
  } catch {
    // Best-effort only — never let the dev-log mirror break a real request.
  }
}

export async function logSystemEvent(params: {
  level?: LogLevel;
  category: string;
  message: string;
  actor?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const level = params.level ?? "INFO";

  const record = await prisma.systemLog.create({
    data: {
      level,
      category: params.category,
      message: params.message,
      actor: params.actor ?? null,
      metadata: params.metadata,
    },
  });

  await appendToJsonlFile({
    id: record.id,
    timestamp: record.createdAt.toISOString(),
    level,
    category: params.category,
    message: params.message,
    actor: params.actor ?? null,
    metadata: params.metadata ?? null,
  });

  return record;
}

export async function getRecentSystemLogs(limit = 100) {
  return prisma.systemLog.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

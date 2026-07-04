import { NextResponse } from "next/server";
import {
  createComment,
  deleteComment,
  listComments,
  updateCommentStatus,
  type CommentStatus,
} from "@/lib/dev/site-comments";

// Site comments are a local development aid only. Every handler re-checks
// NODE_ENV so that even if this route were somehow reachable in a
// production deployment, it refuses to read or write
// .claude/site-comments.json.
export const dynamic = "force-dynamic";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

function notAvailable() {
  return NextResponse.json(
    { ok: false, error: "Not available." },
    { status: 404 },
  );
}

export async function GET() {
  if (!isDev()) {
    return notAvailable();
  }

  const comments = await listComments();
  return NextResponse.json({ ok: true, comments });
}

interface CreateBody {
  pathname?: string;
  target?: {
    tagName?: string;
    textSnippet?: string | null;
    classList?: string;
  };
  position?: { xRatio?: number; yRatio?: number };
  text?: string;
}

export async function POST(request: Request) {
  if (!isDev()) {
    return notAvailable();
  }

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { pathname, target, position, text } = body;

  if (
    typeof pathname !== "string" ||
    typeof text !== "string" ||
    text.trim().length === 0 ||
    !target ||
    typeof target.tagName !== "string" ||
    typeof target.classList !== "string" ||
    !position ||
    typeof position.xRatio !== "number" ||
    typeof position.yRatio !== "number"
  ) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid comment fields." },
      { status: 400 },
    );
  }

  const comment = await createComment({
    pathname,
    target: {
      tagName: target.tagName,
      textSnippet:
        typeof target.textSnippet === "string" ? target.textSnippet : null,
      classList: target.classList,
    },
    position: { xRatio: position.xRatio, yRatio: position.yRatio },
    text: text.trim(),
  });

  return NextResponse.json({ ok: true, comment });
}

interface PatchBody {
  id?: number;
  status?: CommentStatus;
}

export async function PATCH(request: Request) {
  if (!isDev()) {
    return notAvailable();
  }

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (
    typeof body.id !== "number" ||
    (body.status !== "open" && body.status !== "resolved")
  ) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid id/status." },
      { status: 400 },
    );
  }

  const comment = await updateCommentStatus(body.id, body.status);

  if (!comment) {
    return NextResponse.json(
      { ok: false, error: "Comment not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, comment });
}

export async function DELETE(request: Request) {
  if (!isDev()) {
    return notAvailable();
  }

  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  const id = idParam ? Number(idParam) : NaN;

  if (!idParam || Number.isNaN(id)) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid id." },
      { status: 400 },
    );
  }

  const deleted = await deleteComment(id);

  if (!deleted) {
    return NextResponse.json(
      { ok: false, error: "Comment not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

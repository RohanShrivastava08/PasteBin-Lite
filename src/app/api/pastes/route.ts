import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { generateId } from "@/lib/id";
import { getNowMs } from "@/lib/time";
import type { Paste } from "@/lib/types";

type CreatePasteBody = {
  content?: unknown;
  ttl_seconds?: unknown;
  max_views?: unknown;
};

export async function POST(req: Request) {
  let body: CreatePasteBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate content
  if (typeof body.content !== "string" || body.content.trim().length === 0) {
    return NextResponse.json(
      { error: "content must be a non-empty string" },
      { status: 400 }
    );
  }

  // Validate ttl_seconds
  let expires_at: number | null = null;
  if (body.ttl_seconds !== undefined) {
    if (
      typeof body.ttl_seconds !== "number" ||
      !Number.isInteger(body.ttl_seconds) ||
      body.ttl_seconds < 1
    ) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }

    const now = await getNowMs();
    expires_at = now + body.ttl_seconds * 1000;
  }

  // Validate max_views
  let max_views: number | null = null;
  if (body.max_views !== undefined) {
    if (
      typeof body.max_views !== "number" ||
      !Number.isInteger(body.max_views) ||
      body.max_views < 1
    ) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }

    max_views = body.max_views;
  }

  const id = generateId();

  const paste: Paste = {
    id,
    content: body.content,
    created_at: await getNowMs(),
    expires_at,
    max_views,
    views: 0,
  };

  await kv.set(`paste:${id}`, paste);

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/p/${id}`;

  return NextResponse.json(
    { id, url },
    { status: 201 }
  );
}

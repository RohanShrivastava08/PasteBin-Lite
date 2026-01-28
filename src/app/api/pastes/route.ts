import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { generateId } from "@/lib/id";
import { getNowMs } from "@/lib/time";

export async function POST(req: Request) {
  let body: any;

  // Parse JSON safely
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate content
  if (typeof body.content !== "string" || body.content.trim() === "") {
    return NextResponse.json(
      { error: "content must be a non-empty string" },
      { status: 400 }
    );
  }

  // Validate ttl_seconds
  let expires_at: number | null = null;
  if (body.ttl_seconds !== undefined) {
    if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }
    expires_at = (await getNowMs()) + body.ttl_seconds * 1000;
  }

  // Validate max_views
  let max_views: number | null = null;
  if (body.max_views !== undefined) {
    if (!Number.isInteger(body.max_views) || body.max_views < 1) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }
    max_views = body.max_views;
  }

  const id = generateId();
  const now = await getNowMs();

  // Store paste as Redis HASH (correct usage)
  await redis.hSet(`paste:${id}`, {
    id,
    content: body.content,
    created_at: String(now),
    expires_at: expires_at !== null ? String(expires_at) : "",
    max_views: max_views !== null ? String(max_views) : "",
    views: "0",
  });

  // Defensive base URL handling (NO double slashes)
  const rawBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (!rawBase) {
    return NextResponse.json(
      { error: "Server misconfiguration: NEXT_PUBLIC_BASE_URL missing" },
      { status: 500 }
    );
  }

  const baseUrl = rawBase.replace(/\/$/, "");

  return NextResponse.json(
    {
      id,
      url: `${baseUrl}/p/${id}`,
    },
    { status: 201 }
  );
}

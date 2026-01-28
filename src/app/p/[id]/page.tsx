import redis from "@/lib/redis";
import { notFound } from "next/navigation";
import { getNowMs } from "@/lib/time";

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await redis.hGetAll(`paste:${id}`);

  if (!data || !data.id) {
    notFound();
  }

  const expiresAt = data.expires_at ? Number(data.expires_at) : null;
  const maxViews = data.max_views ? Number(data.max_views) : null;
  const views = Number(data.views);

  const now = await getNowMs();

  if (expiresAt !== null && now >= expiresAt) {
    notFound();
  }

  if (maxViews !== null && views >= maxViews) {
    notFound();
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {data.content}
      </pre>
    </main>
  );
}

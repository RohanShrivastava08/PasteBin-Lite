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
  if (!data || !data.id) notFound();

  const expiresAt = data.expires_at ? Number(data.expires_at) : null;
  const maxViews = data.max_views ? Number(data.max_views) : null;
  const views = Number(data.views);

  const now = await getNowMs();

  if (expiresAt !== null && now >= expiresAt) notFound();
  if (maxViews !== null && views >= maxViews) notFound();

  return (
    <main
      style={{
        maxWidth: "760px",
        margin: "4rem auto",
        padding: "2rem",
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
      }}
    >
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: "monospace",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          color: "#111",
        }}
      >
        {data.content}
      </pre>
    </main>
  );
}

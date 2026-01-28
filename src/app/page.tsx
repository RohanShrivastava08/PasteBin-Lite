"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [url, setUrl] = useState("");

  async function createPaste() {
    if (!content.trim()) return;

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        ttl_seconds: ttl ? Number(ttl) : undefined,
        max_views: maxViews ? Number(maxViews) : undefined,
      }),
    });

    const data = await res.json();
    setUrl(data.url);
  }

  function resetForm() {
    setContent("");
    setTtl("");
    setMaxViews("");
    setUrl("");
  }

  return (
    <>
      <textarea
        placeholder="Paste your text here…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="form-row">
        <input
          type="number"
          placeholder="TTL (seconds)"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max views"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
        />
      </div>

      <div className="button-row">
        <button onClick={createPaste}>Create Paste</button>
        <button className="secondary" onClick={resetForm}>
          Reset
        </button>
      </div>

      {url && (
        <div className="share-box">
          <span className="share-label">Shareable link</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {url}
          </a>
        </div>
      )}
    </>
  );
}

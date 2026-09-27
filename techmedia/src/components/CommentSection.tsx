"use client";

import { useActionState } from "react";
import { submitComment, type ActionResult } from "@/lib/actions";
import type { Comment } from "@/lib/db/types";
import { formatDate } from "@/lib/utils";

export default function CommentSection({
  articleId,
  articleSlug,
  comments,
}: {
  articleId: string;
  articleSlug: string;
  comments: Comment[];
}) {
  const action = submitComment.bind(null, articleId, articleSlug);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  return (
    <section className="mt-12 border-t border-black/10 pt-8">
      <h2 className="text-lg font-bold">댓글 {comments.length}개</h2>

      <form action={formAction} className="mt-4 space-y-2" key={state?.ok ? "sent" : "idle"}>
        <input
          type="text"
          name="author_name"
          required
          maxLength={60}
          placeholder="이름"
          className="w-full max-w-xs rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <textarea
          name="content"
          required
          maxLength={2000}
          rows={3}
          placeholder="댓글을 남겨주세요"
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "등록중..." : "댓글 등록"}
          </button>
          {state && !state.ok && (
            <span className="text-sm text-red-600">{state.error}</span>
          )}
          {state?.ok && (
            <span className="text-sm text-green-600">댓글이 등록되었습니다.</span>
          )}
        </div>
      </form>

      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg bg-black/[0.03] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{c.author_name}</span>
              <span className="text-xs text-black/40">
                {formatDate(c.created_at)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-black/80">
              {c.content}
            </p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-black/40">첫 댓글을 남겨보세요.</li>
        )}
      </ul>
    </section>
  );
}

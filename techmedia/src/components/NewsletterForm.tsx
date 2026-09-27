"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type ActionResult } from "@/lib/actions";

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    subscribeNewsletter,
    null
  );

  return (
    <div className="rounded-xl bg-black text-white p-6">
      <h3 className="text-lg font-semibold">뉴스레터 구독</h3>
      <p className="mt-1 text-sm text-white/70">
        주요 테크 뉴스를 이메일로 받아보세요.
      </p>
      {state?.ok ? (
        <p className="mt-4 text-sm font-medium text-green-400">
          구독해주셔서 감사합니다!
        </p>
      ) : (
        <form action={formAction} className="mt-4 flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-full px-4 py-2 text-sm text-black outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {pending ? "처리중..." : "구독"}
          </button>
        </form>
      )}
      {state && !state.ok && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
    </div>
  );
}

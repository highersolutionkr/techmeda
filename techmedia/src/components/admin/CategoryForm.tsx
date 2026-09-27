"use client";

import { useActionState } from "react";
import type { AdminActionResult } from "@/lib/admin/actions";

export default function CategoryForm({
  action,
}: {
  action: (
    prevState: AdminActionResult | null,
    formData: FormData
  ) => Promise<AdminActionResult>;
}) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} key={state?.ok ? "done" : "idle"} className="flex gap-2">
      <input
        type="text"
        name="name"
        required
        placeholder="새 카테고리 이름"
        className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        추가
      </button>
      {state && !state.ok && (
        <span className="self-center text-xs text-red-600">{state.error}</span>
      )}
    </form>
  );
}

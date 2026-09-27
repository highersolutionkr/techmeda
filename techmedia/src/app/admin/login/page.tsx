"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    const redirectTo = searchParams.get("redirectTo") || "/admin";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <input
        type="email"
        required
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
      <input
        type="password"
        required
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "로그인중..." : "로그인"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-xl font-bold">어드민 로그인</h1>
      <p className="mt-1 text-sm text-black/50">
        기사를 작성하고 관리하려면 로그인하세요.
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-xs text-black/40">
        계정은 Supabase 대시보드 Authentication 메뉴에서 관리자가 직접 생성합니다.
      </p>
    </div>
  );
}

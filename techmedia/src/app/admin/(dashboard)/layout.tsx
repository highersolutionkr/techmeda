import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/admin/actions";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-black/[0.02]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold">
              어드민
            </Link>
            <nav className="flex gap-4 text-sm text-black/60">
              <Link href="/admin" className="hover:text-black">기사</Link>
              <Link href="/admin/articles/new" className="hover:text-black">새 글 작성</Link>
              <Link href="/admin/categories" className="hover:text-black">카테고리</Link>
              <Link href="/admin/comments" className="hover:text-black">댓글</Link>
              <Link href="/admin/subscribers" className="hover:text-black">구독자</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-black/50">
            {user?.email && <span>{user.email}</span>}
            <form action={logout}>
              <button className="rounded-md border border-black/15 px-3 py-1 hover:bg-black/5">
                로그아웃
              </button>
            </form>
            <Link href="/" className="hover:text-black" target="_blank">
              사이트 보기 ↗
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

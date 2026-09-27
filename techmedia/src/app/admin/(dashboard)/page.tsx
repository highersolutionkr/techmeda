import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteArticle } from "@/lib/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DashboardArticleRow {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  view_count: number;
  published_at: string | null;
  created_at: string;
  category: { name: string } | { name: string }[] | null;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, status, view_count, published_at, created_at, category:categories(name)")
    .order("created_at", { ascending: false })
    .returns<DashboardArticleRow[]>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">기사 관리</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          + 새 글 작성
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-black/50">
            <tr>
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">조회수</th>
              <th className="px-4 py-3 font-medium">날짜</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(articles ?? []).map((a) => {
              const category = Array.isArray(a.category) ? a.category[0] : a.category;
              return (
              <tr key={a.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/articles/${a.id}/edit`} className="hover:underline">
                    {a.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-black/60">{category?.name ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-medium " +
                      (a.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700")
                    }
                  >
                    {a.status === "published" ? "발행됨" : "초안"}
                  </span>
                </td>
                <td className="px-4 py-3 text-black/60">{a.view_count}</td>
                <td className="px-4 py-3 text-black/40">
                  {formatDate(a.published_at ?? a.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await deleteArticle(a.id);
                    }}
                  >
                    <button className="text-xs text-red-600 hover:underline">
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
              );
            })}
            {(!articles || articles.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-black/40">
                  아직 작성된 기사가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

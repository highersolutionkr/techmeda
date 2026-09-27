import { createClient } from "@/lib/supabase/server";
import { deleteComment } from "@/lib/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CommentRow {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  article: { title: string; slug: string } | { title: string; slug: string }[] | null;
}

export default async function CommentsPage() {
  const supabase = await createClient();
  const { data: comments } = await supabase
    .from("comments")
    .select("id, author_name, content, created_at, article:articles(title, slug)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<CommentRow[]>();

  return (
    <div>
      <h1 className="text-xl font-bold">댓글 관리</h1>
      <ul className="mt-6 space-y-3">
        {(comments ?? []).map((c) => {
          const article = Array.isArray(c.article) ? c.article[0] : c.article;
          return (
          <li key={c.id} className="rounded-lg border border-black/10 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  {c.author_name}{" "}
                  <span className="font-normal text-black/40">
                    · {article?.title ?? "삭제된 기사"} · {formatDate(c.created_at)}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-black/80">{c.content}</p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteComment(c.id, article?.slug ?? "");
                }}
              >
                <button className="shrink-0 text-xs text-red-600 hover:underline">삭제</button>
              </form>
            </div>
          </li>
          );
        })}
        {(!comments || comments.length === 0) && (
          <li className="text-sm text-black/40">등록된 댓글이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

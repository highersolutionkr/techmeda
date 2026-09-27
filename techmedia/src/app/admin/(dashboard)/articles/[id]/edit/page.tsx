import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateArticle } from "@/lib/admin/actions";
import { normalizeArticle, type RawArticleRow } from "@/lib/db/queries";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function EditArticlePage(
  props: PageProps<"/admin/articles/[id]/edit">
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase
      .from("articles")
      .select(
        "*, category:categories(id, name, slug), tags:article_tags(tag:tags(id, name, slug))"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("*").order("name"),
  ]);

  const normalized = normalizeArticle(article as unknown as RawArticleRow | null);
  if (!normalized) notFound();

  const boundUpdate = updateArticle.bind(null, id);

  return (
    <div>
      <h1 className="text-xl font-bold">글 수정</h1>
      <div className="mt-6">
        <ArticleForm action={boundUpdate} categories={categories ?? []} article={normalized} />
      </div>
    </div>
  );
}

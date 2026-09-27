import { createClient } from "@/lib/supabase/server";
import { createArticle } from "@/lib/admin/actions";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="text-xl font-bold">새 글 작성</h1>
      <div className="mt-6">
        <ArticleForm action={createArticle} categories={categories ?? []} />
      </div>
    </div>
  );
}

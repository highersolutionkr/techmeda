import { notFound } from "next/navigation";
import { getCategoryBySlug, getPublishedArticles } from "@/lib/db/queries";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage(
  props: PageProps<"/category/[slug]">
) {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const articles = await getPublishedArticles({ categoryId: category.id, limit: 30 });

  return (
    <div>
      <h1 className="text-2xl font-bold">{category.name}</h1>
      <p className="mt-1 text-sm text-black/50">
        {category.name} 관련 기사 {articles.length}건
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {articles.length === 0 && (
          <p className="text-sm text-black/40">아직 기사가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

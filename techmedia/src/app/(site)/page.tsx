import { getPublishedArticles } from "@/lib/db/queries";
import ArticleCard from "@/components/ArticleCard";
import NewsletterForm from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getPublishedArticles({ limit: 12 });
  const [featured, ...rest] = articles;

  return (
    <div className="space-y-12">
      {featured && (
        <section>
          <ArticleCard article={featured} />
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold">최신 기사</h2>
        {rest.length === 0 && articles.length === 0 ? (
          <p className="text-sm text-black/50">
            아직 발행된 기사가 없습니다. 어드민 페이지에서 첫 기사를 작성해보세요.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      <NewsletterForm />
    </div>
  );
}

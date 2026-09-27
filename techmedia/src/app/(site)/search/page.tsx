import { searchArticles } from "@/lib/db/queries";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const articles = q ? await searchArticles(q) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold">검색</h1>
      <form action="/search" className="mt-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="검색어를 입력하세요"
          className="w-full max-w-md rounded-full border border-black/15 px-4 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </form>

      {q && (
        <p className="mt-4 text-sm text-black/50">
          &quot;{q}&quot; 검색 결과 {articles.length}건
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}

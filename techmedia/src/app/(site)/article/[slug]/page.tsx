import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getArticleBySlug,
  getApprovedComments,
  incrementViewCount,
} from "@/lib/db/queries";
import CommentSection from "@/components/CommentSection";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/article/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

export default async function ArticlePage(
  props: PageProps<"/article/[slug]">
) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") notFound();

  incrementViewCount(article.id).catch(() => {});
  const comments = await getApprovedComments(article.id);

  return (
    <article>
      <div className="mb-6">
        {article.category && (
          <Link
            href={`/category/${article.category.slug}`}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]"
          >
            {article.category.name}
          </Link>
        )}
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-black/50">
          {article.author_name && <span>{article.author_name}</span>}
          {article.published_at && <span>{formatDate(article.published_at)}</span>}
          <span>조회 {article.view_count.toLocaleString()}</span>
        </div>
      </div>

      {article.cover_image_url && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/5">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-[var(--brand)]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/60"
            >
              #{t.name}
            </span>
          ))}
        </div>
      )}

      <CommentSection
        articleId={article.id}
        articleSlug={article.slug}
        comments={comments}
      />
    </article>
  );
}

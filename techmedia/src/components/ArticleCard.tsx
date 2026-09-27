import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/db/types";
import { formatDate } from "@/lib/utils";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-black/5">
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-bold text-black/15">
            {(process.env.NEXT_PUBLIC_SITE_NAME || "T").slice(0, 1)}
          </div>
        )}
      </div>
      <div>
        {article.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
            {article.category.name}
          </span>
        )}
        <h3 className="mt-1 font-bold leading-snug group-hover:underline">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-black/60">
            {article.excerpt}
          </p>
        )}
        <p className="mt-2 text-xs text-black/40">
          {article.published_at ? formatDate(article.published_at) : ""}
        </p>
      </div>
    </Link>
  );
}

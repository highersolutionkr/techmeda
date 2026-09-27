import { createClient } from "@/lib/supabase/server";
import type { Article, Category, Comment, Tag } from "./types";

const ARTICLE_LIST_SELECT = `
  id, title, slug, excerpt, cover_image_url, status, author_name,
  view_count, published_at, created_at,
  category:categories(id, name, slug)
`;

const ARTICLE_FULL_SELECT = `
  *,
  category:categories(id, name, slug),
  tags:article_tags(tag:tags(id, name, slug))
`;

export type RawArticleRow = Record<string, unknown> & {
  category?: Category | Category[] | null;
  tags?: { tag: Tag | null }[];
};

export function normalizeArticle(row: RawArticleRow | null): Article | null {
  if (!row) return null;
  return {
    ...(row as unknown as Article),
    category: Array.isArray(row.category) ? row.category[0] ?? null : (row.category as Category | null | undefined) ?? null,
    tags: row.tags ? row.tags.map((t) => t.tag).filter((t): t is Tag => !!t) : undefined,
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPublishedArticles(opts: {
  categoryId?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Article[]> {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select(ARTICLE_LIST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts.limit) query = query.limit(opts.limit);
  if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 10) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? [])
    .map((row) => normalizeArticle(row as unknown as RawArticleRow))
    .filter((a): a is Article => !!a);
}

export async function searchArticles(term: string): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_SELECT)
    .eq("status", "published")
    .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
    .order("published_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? [])
    .map((row) => normalizeArticle(row as unknown as RawArticleRow))
    .filter((a): a is Article => !!a);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_FULL_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return normalizeArticle(data as unknown as RawArticleRow | null);
}

export async function incrementViewCount(articleId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_view_count", { p_article_id: articleId }).then(
    async (res) => {
      if (res.error) {
        // Fallback if the RPC function doesn't exist yet: read-then-write.
        const { data } = await supabase
          .from("articles")
          .select("view_count")
          .eq("id", articleId)
          .maybeSingle();
        if (data) {
          await supabase
            .from("articles")
            .update({ view_count: (data.view_count ?? 0) + 1 })
            .eq("id", articleId);
        }
      }
    }
  );
}

export async function getApprovedComments(articleId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("article_id", articleId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

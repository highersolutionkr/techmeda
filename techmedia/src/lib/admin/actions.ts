"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");
  return { supabase, user };
}

async function syncTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  articleId: string,
  tagsRaw: string
) {
  const names = Array.from(
    new Set(
      tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

  const tagIds: string[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      tagIds.push(existing.id);
    } else {
      const { data: created, error } = await supabase
        .from("tags")
        .insert({ name, slug })
        .select("id")
        .single();
      if (error) throw error;
      tagIds.push(created.id);
    }
  }

  await supabase.from("article_tags").delete().eq("article_id", articleId);
  if (tagIds.length > 0) {
    await supabase
      .from("article_tags")
      .insert(tagIds.map((tag_id) => ({ article_id: articleId, tag_id })));
  }
}

function readArticleFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as "draft" | "published";

  return {
    title,
    slug: slugify(slugInput || title),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    content: String(formData.get("content") ?? ""),
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
    category_id: String(formData.get("category_id") ?? "") || null,
    author_name: String(formData.get("author_name") ?? "").trim() || null,
    status,
    published_at:
      status === "published" ? new Date().toISOString() : null,
    tagsRaw: String(formData.get("tags") ?? ""),
  };
}

export async function createArticle(
  _prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requireUser();
  const fields = readArticleFields(formData);

  if (!fields.title) return { ok: false, error: "제목을 입력해주세요." };

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt,
      content: fields.content,
      cover_image_url: fields.cover_image_url,
      category_id: fields.category_id,
      author_name: fields.author_name,
      status: fields.status,
      published_at: fields.published_at,
    })
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "이미 동일한 슬러그의 기사가 있습니다. 슬러그를 변경해주세요."
          : "기사 저장 중 오류가 발생했습니다.",
    };
  }

  await syncTags(supabase, data.id, fields.tagsRaw);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/articles/${data.id}/edit?created=1`);
}

export async function updateArticle(
  articleId: string,
  _prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requireUser();
  const fields = readArticleFields(formData);

  if (!fields.title) return { ok: false, error: "제목을 입력해주세요." };

  // Keep original published_at if it was already published before.
  const { data: existing } = await supabase
    .from("articles")
    .select("status, published_at, slug")
    .eq("id", articleId)
    .maybeSingle();

  const published_at =
    fields.status === "published"
      ? existing?.published_at ?? new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("articles")
    .update({
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt,
      content: fields.content,
      cover_image_url: fields.cover_image_url,
      category_id: fields.category_id,
      author_name: fields.author_name,
      status: fields.status,
      published_at,
    })
    .eq("id", articleId);

  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "이미 동일한 슬러그의 기사가 있습니다. 슬러그를 변경해주세요."
          : "기사 저장 중 오류가 발생했습니다.",
    };
  }

  await syncTags(supabase, articleId, fields.tagsRaw);
  revalidatePath("/");
  revalidatePath("/admin");
  if (existing?.slug) revalidatePath(`/article/${existing.slug}`);
  revalidatePath(`/article/${fields.slug}`);
  return { ok: true };
}

export async function deleteArticle(articleId: string) {
  const { supabase } = await requireUser();
  await supabase.from("articles").delete().eq("id", articleId);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createCategory(
  _prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "카테고리 이름을 입력해주세요." };

  const { error } = await supabase
    .from("categories")
    .insert({ name, slug: slugify(name) });

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "이미 존재하는 카테고리입니다." : "저장 중 오류가 발생했습니다.",
    };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(categoryId: string) {
  const { supabase } = await requireUser();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteComment(commentId: string, articleSlug: string) {
  const { supabase } = await requireUser();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/admin/comments");
  revalidatePath(`/article/${articleSlug}`);
}

export async function deleteSubscriber(subscriberId: string) {
  const { supabase } = await requireUser();
  await supabase.from("subscribers").delete().eq("id", subscriberId);
  revalidatePath("/admin/subscribers");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

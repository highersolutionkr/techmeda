"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function subscribeNewsletter(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "올바른 이메일 주소를 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "이미 구독 중인 이메일입니다." };
    }
    return { ok: false, error: "구독 처리 중 오류가 발생했습니다." };
  }

  return { ok: true };
}

export async function submitComment(
  articleId: string,
  articleSlug: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const authorName = String(formData.get("author_name") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!authorName || authorName.length > 60) {
    return { ok: false, error: "이름을 1~60자로 입력해주세요." };
  }
  if (!content || content.length > 2000) {
    return { ok: false, error: "댓글 내용을 1~2000자로 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    article_id: articleId,
    author_name: authorName,
    content,
  });

  if (error) {
    return { ok: false, error: "댓글 등록 중 오류가 발생했습니다." };
  }

  revalidatePath(`/article/${articleSlug}`);
  return { ok: true };
}

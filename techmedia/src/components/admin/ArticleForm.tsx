"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import ImageUploader from "./ImageUploader";
import { uploadArticleImage } from "@/lib/admin/upload";
import { slugify } from "@/lib/utils";
import type { AdminActionResult } from "@/lib/admin/actions";
import type { Article, Category } from "@/lib/db/types";

type Action = (
  prevState: AdminActionResult | null,
  formData: FormData
) => Promise<AdminActionResult>;

export default function ArticleForm({
  action,
  categories,
  article,
}: {
  action: Action;
  categories: Category[];
  article?: Article;
}) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    action,
    null
  );

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [insertingImage, setInsertingImage] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleInsertImage(file: File) {
    setInsertingImage(true);
    try {
      const url = await uploadArticleImage(file);
      const textarea = contentRef.current;
      const markdown = `\n![이미지 설명](${url})\n`;
      if (textarea) {
        const pos = textarea.selectionStart ?? content.length;
        const next = content.slice(0, pos) + markdown + content.slice(pos);
        setContent(next);
      } else {
        setContent((c) => c + markdown);
      }
    } catch {
      alert("이미지 삽입에 실패했습니다.");
    } finally {
      setInsertingImage(false);
    }
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      <div>
        <label className="block text-sm font-medium">제목</label>
        <input
          type="text"
          name="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">슬러그 (URL)</label>
        <input
          type="text"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="자동 생성됩니다"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <p className="mt-1 text-xs text-black/40">/article/{slug || "..."}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">카테고리</label>
          <select
            name="category_id"
            defaultValue={article?.category_id ?? ""}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          >
            <option value="">선택 안 함</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">기자명</label>
          <input
            type="text"
            name="author_name"
            defaultValue={article?.author_name ?? ""}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">요약 (목록/SEO에 노출)</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={article?.excerpt ?? ""}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">표지 이미지</label>
        <div className="mt-1">
          <ImageUploader value={coverImageUrl} onChange={setCoverImageUrl} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">
            본문 (Markdown 지원: **굵게**, - 목록, ## 소제목 등)
          </label>
          <label className="cursor-pointer text-xs text-[var(--brand)] hover:underline">
            {insertingImage ? "업로드중..." : "+ 본문에 이미지 삽입"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={insertingImage}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleInsertImage(file);
              }}
            />
          </label>
        </div>
        <textarea
          ref={contentRef}
          name="content"
          required
          rows={18}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">태그 (쉼표로 구분)</label>
        <input
          type="text"
          name="tags"
          defaultValue={article?.tags?.map((t) => t.name).join(", ") ?? ""}
          placeholder="예: 반도체, HBM, 엔비디아"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>

      <div className="flex items-center gap-4 border-t border-black/10 pt-5">
        <select
          name="status"
          defaultValue={article?.status ?? "draft"}
          className="rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="draft">초안으로 저장</option>
          <option value="published">발행하기</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "저장중..." : "저장"}
        </button>
        {state && !state.ok && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadArticleImage } from "@/lib/admin/upload";

export default function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadArticleImage(file);
      onChange(url);
    } catch (err) {
      setError(
        "이미지 업로드에 실패했습니다: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name="cover_image_url" value={value} readOnly />
      {value ? (
        <div className="relative aspect-[16/9] w-full max-w-sm overflow-hidden rounded-lg bg-black/5">
          <Image src={value} alt="cover" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
          >
            제거
          </button>
        </div>
      ) : (
        <label className="flex aspect-[16/9] w-full max-w-sm cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-black/15 text-sm text-black/40 hover:border-black/30">
          {uploading ? "업로드중..." : "표지 이미지 업로드"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

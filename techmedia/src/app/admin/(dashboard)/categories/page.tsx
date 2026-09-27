import { createClient } from "@/lib/supabase/server";
import { createCategory, deleteCategory } from "@/lib/admin/actions";
import CategoryForm from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold">카테고리 관리</h1>

      <div className="mt-6">
        <CategoryForm action={createCategory} />
      </div>

      <ul className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {(categories ?? []).map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{c.name}</span>
            <form
              action={async () => {
                "use server";
                await deleteCategory(c.id);
              }}
            >
              <button className="text-xs text-red-600 hover:underline">삭제</button>
            </form>
          </li>
        ))}
        {(!categories || categories.length === 0) && (
          <li className="px-4 py-6 text-center text-sm text-black/40">카테고리가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

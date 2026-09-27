import Link from "next/link";
import { getCategories } from "@/lib/db/queries";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "테크미디어";

export default async function Header() {
  const categories = await getCategories();

  return (
    <header className="border-b border-black/10 bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {SITE_NAME}
          </Link>
          <form action="/search" className="hidden sm:block">
            <input
              type="search"
              name="q"
              placeholder="기사 검색"
              className="w-56 rounded-full border border-black/15 px-4 py-1.5 text-sm outline-none focus:border-[var(--brand)]"
            />
          </form>
        </div>
        <nav className="flex gap-5 overflow-x-auto pb-3 text-sm font-medium text-black/70">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="whitespace-nowrap hover:text-[var(--brand)]"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

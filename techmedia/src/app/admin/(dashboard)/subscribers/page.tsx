import { createClient } from "@/lib/supabase/server";
import { deleteSubscriber } from "@/lib/admin/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  const csv = [
    "email,subscribed_at",
    ...(subscribers ?? []).map((s) => `${s.email},${s.created_at}`),
  ].join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          뉴스레터 구독자 ({subscribers?.length ?? 0}명)
        </h1>
        <a
          href={csvHref}
          download="subscribers.csv"
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5"
        >
          CSV 다운로드
        </a>
      </div>

      <ul className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {(subscribers ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <span>{s.email}</span>
              <span className="ml-2 text-xs text-black/40">{formatDate(s.created_at)}</span>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteSubscriber(s.id);
              }}
            >
              <button className="text-xs text-red-600 hover:underline">삭제</button>
            </form>
          </li>
        ))}
        {(!subscribers || subscribers.length === 0) && (
          <li className="px-4 py-6 text-center text-sm text-black/40">아직 구독자가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

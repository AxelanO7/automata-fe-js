import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Service (Hanya baca, bebas menggunakan anon)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 60; // SSG Next.js Revalidation interval

export default async function PseoArchivePage() {
  const { data: articles, error } = await supabase
    .from("pseo_articles")
    .select("slug, title, meta_desc, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen grid items-center justify-center p-8 bg-black">
        <div className="bg-red-950 p-6 rounded-xl border border-red-800 text-red-200">
          <h2 className="font-bold">SYSTEM FAILURE</h2>
          <p>Database synchronization error: {error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl tracking-tighter text-slate-900 font-bold mb-4">
            AI Programmatic Empire
          </h1>
          <p className="text-slate-500 font-medium">
            SSG-Powered Articles automatically generated via Local LLM Agents.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article) => (
            <Link
              key={article.slug}
              href={`/${article.slug}`}
              className="bg-white group overflow-hidden border border-neutral-200 rounded-2xl flex flex-col p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <h2 className="text-xl font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h2>
              <p className="text-slate-600 text-sm line-clamp-3 mb-5 flex-grow">
                {article.meta_desc}
              </p>
              <time className="text-xs font-semibold text-slate-400 mt-auto uppercase tracking-wider">
                {new Date(article.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </Link>
          ))}
          {(!articles || articles.length === 0) && (
            <div className="col-span-full border-2 border-dashed border-neutral-300 rounded-2xl p-16 text-center text-neutral-500">
              Database kosong. Jalankan <code>go run main.go -run=pseo</code> untuk migrasi data PSEO.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

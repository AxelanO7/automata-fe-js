import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{ slug: string }>;
};

// SSG Prerendering di Node Build Time
export async function generateStaticParams() {
  const { data: articles } = await supabase.from("pseo_articles").select("slug");

  if (!articles) return [];
  return articles.map((article) => ({ slug: article.slug }));
}

// Meta Description sempurna dengan Server Actions
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: article } = await supabase
    .from("pseo_articles")
    .select("title, meta_desc")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!article) return { title: "404 - Sector Not Found" };

  return {
    title: article.title,
    description: article.meta_desc,
    openGraph: {
      title: article.title,
      description: article.meta_desc,
      type: "article",
    },
  };
}

// Injeksi Konten HTML Murni / Dangerously Set!
export default async function PseoArticleView({ params }: PageProps) {
  const resolvedParams = await params;
  const { data: article, error } = await supabase
    .from("pseo_articles")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white md:bg-neutral-50 text-slate-900 py-10 md:py-20 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white md:shadow-2xl md:ring-1 ring-slate-200 md:rounded-3xl p-6 md:p-14 lg:p-20">
        <header className="mb-14 border-b border-neutral-100 pb-10">
          <time className="block text-sm tracking-widest text-blue-600 font-semibold uppercase mb-4">
            {new Date(article.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </time>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight md:leading-tight mb-6">
            {article.title}
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            {article.meta_desc}
          </p>
        </header>

        {/* DOM HTML Injection. Pastikan class Tailwind mem-proxy formatting! */}
        <section
          className="prose prose-lg prose-slate prose-h2:text-3xl prose-h2:tracking-tight prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-5 prose-p:leading-8 prose-img:rounded-2xl mx-auto max-w-none prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />
      </article>
    </div>
  );
}

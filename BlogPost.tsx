import { Button } from "@/components/ui/button";
import Footer from "./Footer";
import Header from "./Header";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Link, useParams } from "wouter";
import { Streamdown } from "streamdown";
import { appPortalUrl } from "@/const";
import { BLOG_POSTS } from "./server/_core/blog-data";
import Seo from "./Seo";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: remotePost, isLoading } = trpc.blog.getBySlug.useQuery({ slug: slug || "" });

  const fallbackPost = BLOG_POSTS.find((p) => p.isPublished && p.slug === (slug || ""));
  const effectivePost = remotePost ?? (fallbackPost
    ? {
      id: fallbackPost.slug,
      title: fallbackPost.title,
      slug: fallbackPost.slug,
      excerpt: fallbackPost.excerpt,
      content: fallbackPost.content,
      imageUrl: fallbackPost.imageUrl,
      category: fallbackPost.category,
      createdAt: new Date().toISOString(),
    }
    : null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container max-w-4xl">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 w-1/3" />
            <div className="h-12 bg-muted animate-pulse rounded mb-6" />
            <div className="h-64 bg-muted animate-pulse rounded mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!effectivePost) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="container text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${effectivePost.title} | Mobile Autoworks NZ Blog`}
        description={effectivePost.excerpt}
      />
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="py-8 border-b">
          <div className="container max-w-4xl">
            <Link href="/blog">
              <Button variant="ghost" className="gap-2 mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              {effectivePost.category && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{effectivePost.category}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(effectivePost.createdAt).toLocaleDateString('en-NZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{effectivePost.title}</h1>
            <p className="text-xl text-muted-foreground">{effectivePost.excerpt}</p>
          </div>
        </section>

        {/* Featured Image */}
        {effectivePost.imageUrl && (
          <section className="py-8">
            <div className="container max-w-4xl">
              <img
                src={effectivePost.imageUrl}
                alt={effectivePost.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-8 pb-16">
          <div className="container max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <Streamdown>{effectivePost.content}</Streamdown>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Professional Automotive Service?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact Mobile Autoworks NZ for mobile diagnostics, repairs, and WOF remedial work (no WOF inspections carried out).
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={appPortalUrl("/book/quote")}>
                <Button size="lg">Get a Quote</Button>
              </a>
              <a href="tel:0276421824">
                <Button size="lg" variant="outline">
                  Call 027 642 1824
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

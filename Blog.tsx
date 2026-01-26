import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "./Footer";
import Header from "./Header";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { Link } from "wouter";
import { appPortalUrl } from "@/const";
import { BLOG_POSTS } from "./server/_core/blog-data";
import Seo from "./Seo";

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();

  const fallbackPosts = BLOG_POSTS.filter((p) => p.isPublished).map((p) => ({
    id: p.slug,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    imageUrl: p.imageUrl,
    category: p.category,
    createdAt: new Date().toISOString(),
  }));

  const effectivePosts = posts && posts.length > 0 ? posts : fallbackPosts;

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Mobile Mechanic Blog | Automotive Tips & Advice Auckland"
        description="Helpful maintenance tips, diagnostics advice, and WOF repair guidance from Mobile Autoworks NZ. Expert mobile mechanic insights for Auckland drivers."
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary to-secondary text-primary-foreground py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Automotive Insights & Tips
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                Expert advice, maintenance tips, and industry insights from Mobile Autoworks NZ.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardHeader>
                      <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : effectivePosts && effectivePosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {effectivePosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {post.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        {post.category && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span>{post.category}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString('en-NZ', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="ghost" className="gap-2 p-0 h-auto">
                          Read More
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No blog posts available yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Professional Automotive Service?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get in touch with Mobile Autoworks NZ for mobile diagnostics, repairs, and WOF remedial work across West Auckland.
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

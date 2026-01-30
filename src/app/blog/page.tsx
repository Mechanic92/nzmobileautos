
import { ArrowRight, Calendar, Tag, Clock } from "lucide-react";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Mobile Mechanic Blog | Automotive Tips & Advice Auckland",
  description: "Helpful maintenance tips, diagnostics advice, and WOF repair guidance from Mobile Autoworks NZ. Expert mobile mechanic insights for Auckland drivers.",
};

export default function BlogPage() {
  const publishedPosts = BLOG_POSTS.filter(p => p.isPublished);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Matching the original high-end gradient */}
      <section className="relative overflow-hidden bg-black py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-white">
              Automotive <span className="text-primary">Insights</span> & Tips
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Expert advice, maintenance tips, and industry insights from Mobile Autoworks NZ. 
              We bring the workshop knowledge directly to your screen.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedPosts.map((post) => (
            <Card key={post.slug} className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 flex flex-col">
              <Link href={`/blog/${post.slug}`} className="cursor-pointer flex-1 flex flex-col">
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-md bg-primary text-black text-xs font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(post.date).toLocaleDateString('en-NZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-8 pt-0">
                  <CardDescription className="text-muted-foreground text-base leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt}
                  </CardDescription>
                  
                  <div className="mt-auto flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all uppercase text-xs tracking-widest">
                    Read More <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Modern Newsletter/CTA Section */}
      <section className="pb-32 container">
        <div className="rounded-[3rem] bg-gradient-to-r from-surface2 to-black p-12 lg:p-20 text-center border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Need Help With Your Car?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Don't let a small issue become a major repair. Get an instant quote for diagnostics or repairs today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/instant-quote">
                <Button size="lg" className="px-10 py-6 bg-primary text-black font-bold text-lg hover:scale-105 transition-transform rounded-2xl">
                  Get Instant Quote
                </Button>
              </Link>
              <a href="tel:0276421824">
                <Button variant="secondary" size="lg" className="px-10 py-6 border-border bg-transparent hover:bg-surface2 font-bold text-lg rounded-2xl">
                  Call 027 642 1824
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { ArrowRight, Calendar, Tag, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mobile Mechanic Blog | Automotive Tips & Advice Auckland",
  description: "Helpful maintenance tips, diagnostics advice, and WOF repair guidance from Mobile Autoworks NZ. Expert mobile mechanic insights for Auckland drivers.",
};

const BLOG_POSTS = [
  {
    title: "Mobile Mechanic vs Workshop: What's better for you?",
    slug: "mobile-mechanic-vs-workshop-garage-auckland",
    excerpt: "Should you take your car to a workshop or call a mobile mechanic? We compare convenience, cost, and diagnostic capability in Auckland.",
    date: "2024-03-15",
    category: "Advice",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1632733711679-5292d7763690?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "The Ultimate Pre-Purchase Inspection Checklist",
    slug: "pre-purchase-inspection-checklist-nz",
    excerpt: "Buying a used car in Auckland? Here is exactly what our mechanics look for during a comprehensive pre-purchase inspection.",
    date: "2024-03-10",
    category: "Guides",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Why Dashboard Warning Lights aren't always a disaster",
    slug: "dashboard-warning-lights-explained",
    excerpt: "Seeing a red or orange light on your dash? We explain the common faults and when you need to pull over immediately.",
    date: "2024-03-05",
    category: "Diagnostics",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dcf18193b?auto=format&fit=crop&q=80&w=800",
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary to-yellow-600 text-black py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Automotive Insights & Tips
              </h1>
              <p className="text-lg md:text-xl text-black/90">
                Expert advice, maintenance tips, and industry insights from Mobile Autoworks NZ.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLOG_POSTS.map((post) => (
                <div key={post.slug} className="overflow-hidden border border-white/10 bg-card rounded-lg hover:shadow-lg transition-shadow">
                  {post.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{post.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(post.date).toLocaleDateString('en-NZ', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                    <Link href={`/blog/${post.slug}`}>
                      <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
              <Link href="/instant-quote">
                <button className="inline-flex items-center justify-center px-10 py-4 bg-black text-white font-bold hover:bg-black/90 transition-all rounded-md">
                  Get a Quote
                </button>
              </Link>
              <a href="tel:0276421824">
                <button className="inline-flex items-center justify-center px-10 py-4 border-2 border-black font-bold hover:bg-black hover:text-white transition-all rounded-md">
                  Call 027 642 1824
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

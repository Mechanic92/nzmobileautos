
import { ArrowRight, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata = {
  title: "Mobile Mechanic Blog | Automotive Tips & Advice Auckland",
  description: "Helpful maintenance tips, diagnostics advice, and WOF repair guidance from Mobile Autoworks NZ. Expert mobile mechanic insights for Auckland drivers.",
};

export default function BlogPage() {
  const publishedPosts = BLOG_POSTS.filter(p => p.isPublished);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-yellow-600 py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-bold text-black mb-6 tracking-tight">
              Automotive <span className="opacity-80">Insights</span> & Tips
            </h1>
            <p className="text-xl lg:text-2xl text-black/80 font-medium leading-relaxed">
              Expert advice, maintenance tips, and industry insights from Auckland's #1 mobile mechanic. 
              We're here to keep you on the road and out of the workshop.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {publishedPosts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-surface border border-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all hover:translate-y-[-4px]"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 rounded-full bg-primary text-black text-xs font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-muted text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(post.date).toLocaleDateString('en-NZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-muted leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all uppercase text-xs tracking-widest">
                  Read Full Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 container">
        <div className="bg-surface2 rounded-[2.5rem] p-12 lg:p-20 text-center border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -ml-32 -mb-32" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Need Professional Automotive Service?
            </h2>
            <p className="text-xl text-muted mb-10">
              Get in touch with Mobile Autoworks NZ for mobile diagnostics, repairs, and WOF remedial work across Auckland.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/instant-quote"
                className="px-10 py-5 bg-primary text-black font-bold rounded-2xl hover:bg-primary/90 transition-all text-lg shadow-lg shadow-primary/20"
              >
                Get Instant Quote
              </Link>
              <a
                href="tel:0276421824"
                className="px-10 py-5 border border-border bg-surface hover:bg-surface2 font-bold rounded-2xl transition-all text-lg"
              >
                Call 027 642 1824
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

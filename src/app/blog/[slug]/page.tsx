
import { ArrowLeft, Calendar, Tag, MessageSquare, Clock, User, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-data";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return {};

  return {
    title: `${post.title} | Mobile Autoworks NZ Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.imageUrl],
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Enhanced markdown-ish to JSX converter
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, i) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-3xl lg:text-4xl font-bold mt-16 mb-8 text-white tracking-tight">{trimmed.replace('## ', '')}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-2xl lg:text-3xl font-bold mt-12 mb-6 text-white tracking-tight">{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={i} className="text-xl lg:text-2xl font-bold mt-8 mb-4 text-white tracking-tight">{trimmed.replace('#### ', '')}</h4>;
      }
      if (trimmed.startsWith('*   ') || trimmed.startsWith('-   ')) {
        const items = trimmed.split('\n').map(item => item.replace(/^[\*\-]\s+/, '').trim());
        return (
          <ul key={i} className="list-none space-y-4 mb-10">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-3 text-lg text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (trimmed.match(/^\d+\.\s+/)) {
        const items = trimmed.split('\n').map(item => item.replace(/^\d+\.\s+/, '').trim());
        return (
          <ol key={i} className="list-none space-y-4 mb-10">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-4 text-lg text-muted-foreground">
                <span className="font-bold text-primary min-w-[1.5rem]">{j + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      
      // Handle bold and emphasis manually
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return <p key={i} className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">{formattedParts}</p>;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Article Header */}
      <section className="relative overflow-hidden bg-black pt-16 lg:pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <Link 
            href="/blog" 
            className="group inline-flex items-center gap-2 text-primary font-bold mb-12 uppercase text-xs tracking-widest hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
          </Link>
          
          <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-sm text-muted-foreground mb-8 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-2 text-primary">
              <Tag className="w-4 h-4" /> {post.category}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 
              {new Date(post.date).toLocaleDateString('en-NZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> 6 min read
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tighter text-white">
            {post.title}
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium max-w-3xl">
            {post.excerpt}
          </p>
          
          <div className="mt-12 flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-black text-xl">
              C
            </div>
            <div>
              <div className="text-white font-bold">Chris</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Chief Mechanic • Auckland</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="pb-16 bg-black">
        <div className="container max-w-5xl">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-surface2 relative aspect-[21/9]">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-16 pb-32 container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 max-w-6xl mx-auto">
          {/* Main Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            {renderContent(post.content)}
          </article>

          {/* Sidebar */}
          <aside className="space-y-12">
            <div className="sticky top-32 space-y-12">
              <div className="p-8 rounded-[2rem] bg-surface border border-border">
                <h3 className="text-xl font-bold mb-4 text-white">Share Article</h3>
                <div className="flex gap-4">
                  <button className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-primary text-black">
                <h3 className="text-2xl font-bold mb-4 leading-tight">Car Problems?</h3>
                <p className="font-medium mb-8 text-black/80">
                  Get Chris to diagnose your vehicle at your home or workplace today.
                </p>
                <Link href="/instant-quote">
                  <Button size="lg" className="w-full bg-black text-white hover:bg-black/90 rounded-xl font-bold py-6">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-32 container">
        <div className="bg-surface2 rounded-[3.5rem] p-12 lg:p-24 text-center border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white tracking-tight">
              Ready for a professional service?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the convenience of Auckland's top-rated mobile mechanic. 
              Transparent pricing, expert care, at your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/instant-quote"
                className="px-12 py-6 bg-primary text-black font-bold rounded-[2rem] hover:bg-primary/90 transition-all text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                Get Instant Quote <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:0276421824"
                className="px-12 py-6 border-2 border-border bg-transparent hover:bg-surface2 font-bold rounded-[2rem] transition-all text-xl flex items-center justify-center gap-3 text-white"
              >
                <MessageSquare className="w-5 h-5" /> 027 642 1824
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

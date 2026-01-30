
import { ArrowLeft, Calendar, Tag, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-data";

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

  // Simple markdown-ish to JSX converter
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, i) => {
      if (block.startsWith('## ')) {
        return <h2 key={i} className="text-3xl font-bold mt-12 mb-6">{block.replace('## ', '')}</h2>;
      }
      if (block.startsWith('### ')) {
        return <h3 key={i} className="text-2xl font-bold mt-8 mb-4">{block.replace('### ', '')}</h3>;
      }
      if (block.startsWith('#### ')) {
        return <h4 key={i} className="text-xl font-bold mt-6 mb-3">{block.replace('#### ', '')}</h4>;
      }
      if (block.startsWith('*   ')) {
        const items = block.split('\n').map(item => item.replace('*   ', '').trim());
        return (
          <ul key={i} className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
            {items.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        );
      }
      if (block.startsWith('1.  ')) {
        const items = block.split('\n').map(item => item.replace(/^\d+\.\s+/, '').trim());
        return (
          <ol key={i} className="list-decimal list-inside space-y-2 mb-6 text-muted-foreground">
            {items.map((item, j) => <li key={j}>{item}</li>)}
          </ol>
        );
      }
      // Handle bold
      const formattedBlock = block.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part);
      return <p key={i} className="text-lg text-muted-foreground leading-relaxed mb-6">{formattedBlock}</p>;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="pt-12 pb-12 border-b border-border">
        <div className="container max-w-4xl">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-primary font-bold mb-12 hover:gap-4 transition-all uppercase text-xs tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          
          <div className="flex items-center gap-6 text-sm text-muted mb-6 uppercase tracking-widest font-bold">
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
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted leading-relaxed font-medium">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-12 bg-surface">
        <div className="container max-w-5xl">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-border">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto object-cover max-h-[600px]"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 pb-32">
        <div className="container max-w-3xl">
          <div className="prose prose-invert prose-lg max-w-none">
            {renderContent(post.content)}
          </div>
          
          <div className="mt-20 pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-black text-xl">
                C
              </div>
              <div>
                <div className="font-bold">Chris</div>
                <div className="text-sm text-muted">Auckland Mobile Mechanic</div>
              </div>
            </div>
            
            <Link
              href="/instant-quote"
              className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              Book Chris Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="pb-24 container">
        <div className="bg-surface2 rounded-[2.5rem] p-12 lg:p-20 text-center border border-border relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Have questions about {post.category}?
            </h2>
            <p className="text-xl text-muted mb-10">
              Give us a call or text for a quick chat. We're happy to help with any automotive advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0276421824"
                className="px-10 py-5 bg-primary text-black font-bold rounded-2xl hover:bg-primary/90 transition-all text-lg flex items-center justify-center gap-3"
              >
                <MessageSquare className="w-5 h-5" /> 027 642 1824
              </a>
              <Link
                href="/contact"
                className="px-10 py-5 border border-border bg-surface hover:bg-surface2 font-bold rounded-2xl transition-all text-lg"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

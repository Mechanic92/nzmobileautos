import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Blog",
  description: "Expert automotive advice, car maintenance tips, and industry insights from Mobile Autoworks NZ. Learn how to keep your vehicle running smoothly.",
};

const blogPosts = [
  {
    slug: "pre-purchase-inspection-guide",
    title: "The Ultimate Pre-Purchase Inspection Guide",
    excerpt: "Buying a used car? Learn what to look for and why a professional inspection can save you thousands.",
    date: "2026-01-15",
    readTime: "8 min read",
    category: "Buying Tips",
    image: "🚗",
  },
  {
    slug: "warning-lights-explained",
    title: "Dashboard Warning Lights: What They Really Mean",
    excerpt: "Decode your car's warning lights and learn which ones require immediate attention versus routine service.",
    date: "2026-01-10",
    readTime: "6 min read",
    category: "Diagnostics",
    image: "⚠️",
  },
  {
    slug: "service-intervals-guide",
    title: "Understanding Your Car's Service Intervals",
    excerpt: "When should you service your car? We break down the difference between basic and comprehensive services.",
    date: "2026-01-05",
    readTime: "5 min read",
    category: "Maintenance",
    image: "🔧",
  },
  {
    slug: "mobile-mechanic-benefits",
    title: "5 Reasons to Choose a Mobile Mechanic",
    excerpt: "Discover why more Auckland drivers are switching to mobile mechanic services for convenience and transparency.",
    date: "2025-12-28",
    readTime: "4 min read",
    category: "Industry Insights",
    image: "🏠",
  },
  {
    slug: "winter-car-care",
    title: "Preparing Your Car for Auckland's Winter",
    excerpt: "Essential maintenance tips to keep your vehicle running smoothly through the colder months.",
    date: "2025-12-20",
    readTime: "7 min read",
    category: "Seasonal Tips",
    image: "❄️",
  },
  {
    slug: "common-diagnostic-codes",
    title: "Common OBD2 Codes and What They Mean",
    excerpt: "A guide to understanding the most frequent diagnostic trouble codes and their implications.",
    date: "2025-12-15",
    readTime: "10 min read",
    category: "Diagnostics",
    image: "💻",
  },
];

const categories = ["All", "Buying Tips", "Diagnostics", "Maintenance", "Industry Insights", "Seasonal Tips"];

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-16 pb-24">
      {/* Hero */}
      <section className="container pt-12 lg:pt-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Automotive <span className="text-primary">Insights</span>
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            Expert advice, maintenance tips, and industry insights to help you make informed 
            decisions about your vehicle.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === "All"
                  ? "bg-primary text-primaryText"
                  : "bg-surface border border-border hover:border-primary/50 text-muted hover:text-text"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      <section className="container">
        <div className="rounded-[2rem] bg-primary p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primaryText/10 text-primaryText text-sm font-medium">
              Featured Post
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-primaryText">
              {blogPosts[0].title}
            </h2>
            <p className="text-primaryText/80 text-lg leading-relaxed">
              {blogPosts[0].excerpt}
            </p>
            <div className="flex items-center gap-4 text-primaryText/60 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blogPosts[0].date).toLocaleDateString('en-NZ', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blogPosts[0].readTime}</span>
              </div>
            </div>
            <Link
              href={`/blog/${blogPosts[0].slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primaryText text-bg font-bold hover:scale-105 transition-all"
            >
              Read Article <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center text-[120px] lg:text-[180px]">
            {blogPosts[0].image}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all overflow-hidden"
            >
              <div className="aspect-video bg-surface2 flex items-center justify-center text-6xl border-b border-border">
                {post.image}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium self-start mb-4">
                  {post.category}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-muted text-xs pt-4 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="rounded-[2rem] bg-surface2 p-12 text-center space-y-6 border border-border">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Need Expert Advice for Your Vehicle?
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Our team is here to help. Get an instant quote for diagnostics, pre-purchase inspections, or servicing.
          </p>
          <a
            href="/instant-quote"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primaryText font-bold text-lg hover:bg-primary/90 transition-all"
          >
            Get Instant Quote
          </a>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { BlogHeader, BlogFooter, BlogCTA } from "@/components/blog/Shell";
import { SITE_URL } from "@/lib/blog";

export const metadata: Metadata = {
  title: {
    default: "Blog do Pratinho Feliz",
    template: "%s | Blog do Pratinho Feliz",
  },
  alternates: {
    types: {
      "application/rss+xml": [{ url: `${SITE_URL}/blog/rss.xml`, title: "Blog do Pratinho Feliz" }],
    },
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <BlogHeader />
      <main className="flex-1">{children}</main>
      <BlogCTA />
      <BlogFooter />
    </div>
  );
}

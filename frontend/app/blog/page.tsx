"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, User, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

const posts = [
  {
    title: "How to Beat the ATS in 2026",
    excerpt: "Learn the latest tricks and keywords that modern Applicant Tracking Systems look for in a professional resume.",
    author: "Career Experts",
    date: "April 28, 2026",
    category: "Career Advice"
  },
  {
    title: "Top 10 Skills for AI Engineers",
    excerpt: "The job market for AI is booming. Make sure your resume highlights these critical technical and soft skills.",
    author: "SkillSense Team",
    date: "April 25, 2026",
    category: "Industry Trends"
  },
  {
    title: "The Art of Writing a Cover Letter",
    excerpt: "Why your cover letter matters more than ever and how AI can help you personalize it for every application.",
    author: "Muhammad Uzair",
    date: "April 20, 2026",
    category: "Guides"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <BookOpen size={32} className="text-brand-primary" weight="fill" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            SkillSense <span className="text-brand-primary">Blog</span>
          </h1>
          <p className="text-text-muted">
            Insights, guides, and tips to help you navigate the modern job market.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {posts.map((post, index) => (
             <motion.article 
               key={index}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className="glass-card overflow-hidden group cursor-pointer"
             >
                <div className="h-48 bg-white/5 flex items-center justify-center border-b border-white/10 group-hover:bg-brand-primary/5 transition-colors">
                    <BookOpen size={48} weight="thin" className="text-white/10 group-hover:text-brand-primary/20 transition-all" />
                </div>
                <div className="p-8">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-4">
                      {post.category}
                   </div>
                   <h2 className="text-xl font-bold text-white mb-4 group-hover:text-brand-primary transition-colors line-clamp-2">
                     {post.title}
                   </h2>
                   <p className="text-text-muted text-sm leading-relaxed mb-6 line-clamp-3">
                     {post.excerpt}
                   </p>
                   <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                          {post.author[0]}
                        </div>
                        <span className="text-xs text-gray-400">{post.author}</span>
                      </div>
                      <ArrowRight size={18} className="text-brand-primary group-hover:translate-x-2 transition-transform" />
                   </div>
                </div>
             </motion.article>
           ))}
        </div>

        <div className="mt-20 text-center">
            <button className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">
                Load More Articles
            </button>
        </div>
      </div>
    </div>
  );
}

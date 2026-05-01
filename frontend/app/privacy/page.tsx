"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Eye, Lock, Database } from "@phosphor-icons/react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Data We Collect",
      icon: Database,
      content: "We collect information you provide directly to us, such as when you create an account, upload a resume, or contact us for support. This includes your name, email address, and any professional data contained within your resumes."
    },
    {
      title: "How We Use Your Data",
      icon: Eye,
      content: "Your data is primarily used to provide our AI-driven resume analysis and builder services. We use anonymized and aggregated data to improve our machine learning models and platform performance."
    },
    {
      title: "Data Security",
      icon: Lock,
      content: "We implement industry-standard security measures to protect your personal information. All resume uploads are encrypted at rest and in transit. We do not sell your personal data to third parties."
    }
  ];

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-brand-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-brand-success" weight="fill" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Privacy <span className="text-brand-primary">Policy</span>
          </h1>
          <p className="text-text-muted">
            Last updated: May 1, 2026. Your privacy is our top priority.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <section key={index} className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Icon size={24} weight="duotone" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                </div>
                <p className="text-text-muted leading-relaxed">
                  {section.content}
                </p>
              </section>
            );
          })}

          <div className="prose prose-invert max-w-none text-text-muted">
            <h3 className="text-xl font-bold text-white mb-4">Your Rights</h3>
            <p className="mb-4">
              You have the right to access, correct, or delete your personal information at any time. You can manage your data through your profile settings or by contacting our support team.
            </p>
            <p>
              By using SkillSense, you agree to the collection and use of information in accordance with this policy. If you have any questions, please contact us at <a href="mailto:uzairkhilji307@gmail.com" className="text-brand-primary underline">uzairkhilji307@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

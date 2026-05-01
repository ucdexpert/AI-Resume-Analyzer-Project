"use client";

import { motion } from "framer-motion";
import { Plus, Minus, Question } from "@phosphor-icons/react";
import { useState } from "react";

const faqs = [
  {
    question: "What is SkillSense?",
    answer: "SkillSense is an AI-powered resume analyzer and builder that helps job seekers optimize their professional profiles using advanced Llama 3.3 AI technology."
  },
  {
    question: "How does the ATS score work?",
    answer: "Our AI simulates modern Applicant Tracking Systems by scanning your resume for keywords, formatting, and structural elements to give you a percentage match for your target industry."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take privacy seriously. Your resumes are encrypted and are only used for generating analysis. We never sell your data to third parties."
  },
  {
    question: "Can I use it for free?",
    answer: "Yes, SkillSense offers a free tier that allows you to perform basic analysis. For advanced features and unlimited exports, you can upgrade to a Pro plan."
  },
  {
    question: "What file formats do you support?",
    answer: "Currently, we support PDF files for analysis. The Resume Builder can export to PDF, DOCX, and TXT formats."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen py-20 px-6 bg-bg-dark">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Question size={32} className="text-brand-primary" weight="fill" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Frequently Asked <span className="text-brand-primary">Questions</span>
          </h1>
          <p className="text-text-muted">
            Find quick answers to common questions about our platform and services.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-bold text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <Minus size={20} className="text-brand-primary" weight="bold" />
                ) : (
                  <Plus size={20} className="text-gray-500" weight="bold" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl text-center">
            <h3 className="text-xl font-bold mb-2 text-white">Still have questions?</h3>
            <p className="text-text-muted mb-6 text-sm">Our support team is always here to help you with anything.</p>
            <button className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all">
                Contact Support
            </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for AnimatePresence to work with auto height
import { ReactNode } from "react";
function AnimatePresence({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

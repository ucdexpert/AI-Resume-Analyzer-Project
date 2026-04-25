'use client';

import React from 'react';
import { Lightbulb } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function SuggestionCard({ items }: { items: string[] }) {
  return (
    <div className="glass-card p-6 md:p-8">
      <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3 text-brand-primary">
        <Lightbulb size={32} weight="duotone" />
        Actionable Suggestions
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-brand-primary/30 transition-all"
          >
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                {index + 1}
              </span>
              <p className="text-text-muted leading-relaxed pt-1">{item}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

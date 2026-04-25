'use client';

import React from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function StrengthsList({ items }: { items: string[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-heading font-bold flex items-center gap-2 text-brand-success">
        <CheckCircle size={24} weight="fill" />
        Top Strengths
      </h3>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 border-l-4 border-l-brand-success flex items-start gap-3"
          >
            <span className="text-brand-success mt-0.5">•</span>
            <p className="text-text-primary leading-relaxed">{item}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

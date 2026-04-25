'use client';

import React from 'react';
import { ChatCircleDots, Lightbulb } from '@phosphor-icons/react';

interface Question {
  question: string;
  category: string;
  suggested_answer: string;
}

export default function InterviewQuestions({ questions }: { questions: Question[] }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="glass-card p-8">
      <h3 className="text-2xl font-heading font-bold mb-8 flex items-center gap-3 text-brand-primary">
        <ChatCircleDots size={32} weight="duotone" />
        Predicted Interview Questions
      </h3>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={i} className="p-6 bg-white/5 rounded-xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest">
                {q.category}
              </span>
              <span className="text-text-muted text-xs font-mono">Q.0{i+1}</span>
            </div>
            <p className="text-xl font-heading text-white mb-6">
              {q.question}
            </p>
            <div className="flex gap-4 p-4 bg-brand-success/5 rounded-lg border border-brand-success/10">
              <Lightbulb size={24} className="text-brand-success flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-brand-success uppercase mb-1">Suggested Approach</p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {q.suggested_answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { evaluateAnswer } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatCircleDots, Microphone, PaperPlaneTilt, CheckCircle, WarningCircle, Lightbulb } from '@phosphor-icons/react';

interface Question {
  question: string;
  category: string;
  suggested_answer: string;
}

export default function MockInterview({ questions, resumeText }: { questions: Question[], resumeText: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [completed, setCompleted] = useState<any[]>([]);

  const handleSubmit = async () => {
    if (!userAnswer || loading) return;
    setLoading(true);
    try {
      const result = await evaluateAnswer(questions[currentIdx].question, userAnswer, resumeText);
      setFeedback(result);
    } catch (err) {
      alert("Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCompleted([...completed, { ...feedback, question: questions[currentIdx].question }]);
    setFeedback(null);
    setUserAnswer('');
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCurrentIdx(-1); // Finished
    }
  };

  if (currentIdx === -1) {
    const avgScore = completed.reduce((acc, curr) => acc + curr.score, 0) / completed.length;
    return (
      <div className="glass-card p-10 text-center">
        <CheckCircle size={80} weight="duotone" className="text-brand-success mx-auto mb-6" />
        <h3 className="text-3xl font-heading font-bold mb-2">Interview Completed!</h3>
        <p className="text-text-muted mb-8 text-lg">You've successfully answered all technical and behavioral questions.</p>
        <div className="inline-block p-6 bg-brand-success/10 rounded-2xl border border-brand-success/20 mb-8">
          <p className="text-xs font-bold text-brand-success uppercase tracking-widest mb-1">Average Performance Score</p>
          <p className="text-5xl font-bold text-white">{avgScore.toFixed(1)}<span className="text-xl text-text-muted">/10</span></p>
        </div>
        <button onClick={() => window.location.reload()} className="neon-button block mx-auto">Restart Session</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="glass-card p-8 min-h-[500px] flex flex-col">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
            <Microphone size={24} weight="duotone" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl">AI Mock Interview</h3>
            <p className="text-xs text-text-muted">Question {currentIdx + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full transition-colors ${i <= currentIdx ? 'bg-brand-primary' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-2 block">{currentQuestion.category}</span>
                <p className="text-2xl font-heading text-white leading-tight">{currentQuestion.question}</p>
              </div>

              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here... try to be specific and use the STAR method for behavioral questions."
                  className="w-full h-40 p-5 bg-white/5 border border-white/10 rounded-2xl text-text-primary outline-none focus:border-brand-primary/50 resize-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer || loading}
                  className="absolute bottom-4 right-4 p-3 bg-brand-primary rounded-xl hover:bg-brand-primary/80 transition-all disabled:opacity-50"
                >
                  <PaperPlaneTilt size={24} weight="bold" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl flex flex-col items-center justify-center border ${feedback.score >= 7 ? 'bg-brand-success/10 border-brand-success/20 text-brand-success' : 'bg-brand-warning/10 border-brand-warning/20 text-brand-warning'}`}>
                  <span className="text-xs font-bold uppercase">Score</span>
                  <span className="text-3xl font-bold">{feedback.score}</span>
                </div>
                <div className="flex-grow p-4 glass-card border-white/10">
                  <p className="text-xs font-bold text-text-muted uppercase mb-1">AI Feedback</p>
                  <p className="text-sm text-text-primary">{feedback.feedback}</p>
                </div>
              </div>

              <div className="p-6 bg-brand-success/5 rounded-2xl border border-brand-success/10">
                <h4 className="flex items-center gap-2 text-brand-success font-bold mb-3">
                  <Lightbulb size={20} weight="fill" />
                  Better Answer
                </h4>
                <p className="text-sm text-text-muted leading-relaxed italic">
                  "{feedback.better_answer}"
                </p>
              </div>

              <button
                onClick={handleNext}
                className="neon-button w-full flex items-center justify-center gap-2"
              >
                Next Question
                <PaperPlaneTilt size={20} weight="bold" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-background-primary/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-brand-primary font-bold animate-pulse">AI is evaluating your answer...</p>
          </div>
        </div>
      )}
    </div>
  );
}

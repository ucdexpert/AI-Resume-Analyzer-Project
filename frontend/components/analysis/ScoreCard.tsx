'use client';

import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

interface ScoreCardProps {
  score: number;
  label: string;
  size?: 'sm' | 'lg';
  description?: string;
}

export default function ScoreCard({ score, label, size = 'sm', description }: ScoreCardProps) {
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // success
    if (s >= 60) return '#3b82f6'; // primary
    if (s >= 40) return '#f59e0b'; // warning
    return '#ef4444'; // danger
  };

  const color = getColor(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`glass-card p-6 flex flex-col items-center justify-center text-center ${
        size === 'lg' ? 'md:p-10' : ''
      }`}
    >
      <div className={`${size === 'lg' ? 'w-48 h-48 mb-6' : 'w-24 h-24 mb-4'}`}>
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            pathColor: color,
            textColor: '#ffffff',
            trailColor: 'rgba(255, 255, 255, 0.05)',
            textSize: '24px',
            pathTransitionDuration: 1.5,
          })}
        />
      </div>
      <h3 className={`font-heading font-bold ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
        {label}
      </h3>
      {description && <p className="text-text-muted text-sm mt-2">{description}</p>}
    </motion.div>
  );
}

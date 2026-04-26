'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartLineUp } from '@phosphor-icons/react';

interface ScoreHistoryItem {
  created_at: string;
  overall_score: number;
}

interface ScoreTrendProps {
  data: ScoreHistoryItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-text-muted text-xs mb-1">
          {new Date(label).toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <p className="text-brand-primary font-bold text-lg">
          Score: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function ScoreTrend({ data }: ScoreTrendProps) {
  // Sort data by date and format it for the chart
  const chartData = [...data]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(item => ({
      date: item.created_at,
      score: item.overall_score
    }));

  if (chartData.length < 1) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mb-12"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-heading font-bold flex items-center gap-2">
            <ChartLineUp size={24} weight="duotone" className="text-brand-primary" />
            Score Progress
          </h3>
          <p className="text-text-muted text-sm">Visualize your resume improvement over time</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              hide={true}
            />
            <YAxis 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#00E5FF" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
              animationDuration={1500}
              dot={{ fill: '#00E5FF', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {chartData.length === 1 && (
        <p className="text-center text-text-muted text-sm mt-4">
          Upload more resumes to see your progress trend!
        </p>
      )}
    </motion.div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { FilePdf, FileDoc, Globe, GithubLogo, Envelope, Phone, MapPin } from '@phosphor-icons/react';
import useBuilderStore from '@/stores/useBuilderStore';
import ResumePreview from '@/components/generators/ResumePreview';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function PublicResumePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const store = useBuilderStore();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(`${API_URL}/builder/public/${id}`);
        setData(response.data);
        // Sync with store for preview component
        store.setAll(response.data);
      } catch (err) {
        console.error("Failed to fetch public resume", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResume();
  }, [id]);

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mb-4"></div>
            <p className="text-text-muted animate-pulse font-bold tracking-widest uppercase text-xs">Loading Resume...</p>
        </div>
    );
  }

  if (!data) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black text-white mb-4">404</h1>
            <p className="text-text-muted">This resume link is invalid or has been removed.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                    <Globe size={18} weight="fill" className="text-black" />
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Public Portfolio View</span>
            </div>
            <div className="flex gap-4">
                <button className="text-[10px] font-bold text-text-muted hover:text-white transition-colors uppercase tracking-widest">Report Profile</button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden shadow-brand-primary/10">
            <ResumePreview />
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-text-muted text-xs">Built with <span className="text-white font-bold tracking-tight">AI Resume Analyzer</span></p>
        </div>
      </div>
    </div>
  );
}

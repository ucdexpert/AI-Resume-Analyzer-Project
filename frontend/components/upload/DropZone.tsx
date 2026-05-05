'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadSimple, FilePdf, X, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { analyzeResume } from '../../lib/api';
import { useAnalysisStore } from '../../stores/useAnalysisStore';
import useAuthStore from '../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '../../stores/useLanguageStore';
import UpgradeModal from '../shared/UpgradeModal';

interface DropZoneProps {
  onAuthRequired: (file: File, jobDescription: string) => void;
}

export default function DropZone({ onAuthRequired }: DropZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { setAnalyzing, setResult, setError, isAnalyzing, error } = useAnalysisStore();
  const { lang } = useLanguageStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, [setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isAnalyzing
  });

  const handleUpload = async () => {
    if (!file) return;

    if (!isLoggedIn) {
      onAuthRequired(file, jobDescription);
      return;
    }

    setAnalyzing(true);
    try {
      const data = await analyzeResume(file, jobDescription, lang);
      setResult(data);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.message || "Something went wrong during analysis.";
      if (message.toLowerCase().includes('limit') || message.toLowerCase().includes('upgrade')) {
        setShowUpgradeModal(true);
      }
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        className={`relative group cursor-pointer glass-card border-2 border-dashed transition-all duration-300 ${
          isDragActive ? 'bg-brand-primary/5 border-brand-primary scale-[1.02]' : 'hover:bg-white/5 border-white/10'
        }`}
      >
        <div {...getRootProps()} className="p-12 flex flex-col items-center justify-center w-full h-full">
          <input {...getInputProps()} />

          {!file ? (
            <div className="text-center animate-fade-in">
              <div className="mb-4 p-4 rounded-full bg-brand-primary/10 inline-block group-hover:scale-110 transition-transform duration-300">
                <UploadSimple size={48} weight="duotone" className="text-brand-primary" />
              </div>
              <h3 className="text-xl font-heading mb-2">Drag & Drop Resume</h3>
              <p className="text-text-muted">Support PDF only (Max 5MB)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full animate-fade-in">
              <div className="flex items-center gap-4 p-4 glass-card border-brand-primary/30 w-full">
                <FilePdf size={40} weight="duotone" className="text-brand-primary" />
                <div className="flex-grow overflow-hidden">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {isDragActive && (
          <div className="absolute inset-0 rounded-xl bg-brand-primary/5 shadow-neon-glow pointer-events-none" />
        )}
      </div>

      {/* Optional Job Description */}
      {file && !isAnalyzing && (
        <div className="w-full animate-fade-in">
          <label className="block text-sm font-medium text-text-muted mb-2">
            Target Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to check matching keywords and percentage..."
            className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder:text-text-muted/50 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all outline-none resize-none"
          />
        </div>
      )}

      {/* Action Button & Errors */}
      <div className="flex flex-col items-center gap-4">
        {file && !isAnalyzing && (
          <button
            onClick={handleUpload}
            className="neon-button w-full sm:w-auto min-w-[200px] animate-fade-in"
          >
            Analyze Resume
          </button>
        )}

        {isAnalyzing && (
          <div className="flex items-center gap-3 text-brand-primary animate-pulse">
            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">AI is analyzing your resume...</span>
          </div>
        )}

        {error && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg border animate-fade-in ${
              error.toLowerCase().includes('limit')
              ? 'text-brand-warning bg-brand-warning/10 border-brand-warning/20'
              : 'text-brand-danger bg-brand-danger/10 border-brand-danger/20'
            }`}
          >
            <WarningCircle size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{error}</span>
              {error.toLowerCase().includes('limit') && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-[10px] text-brand-warning underline font-black uppercase tracking-widest mt-1 text-left"
                >
                  Upgrade to Pro for Unlimited Access
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}

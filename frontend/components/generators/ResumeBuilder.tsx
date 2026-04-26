'use client';

import React, { useState, useEffect } from 'react';
import useBuilderStore from '../../stores/useBuilderStore';
import { 
  saveBuilderResume, 
  getBuilderResume, 
  generateBuilderPDF, 
  generateBuilderDOCX,
  generateBuilderTXT,
  generateAISummary,
  generateBulletPoints
} from '../../lib/api';
import { 
  User, Briefcase, GraduationCap, Wrench, 
  DownloadSimple, Plus, Trash, FilePdf, 
  CloudArrowUp, MagicWand, GithubLogo, Globe, 
  Certificate, CheckCircle, PaintBrush, Selection,
  Sparkle, FileDoc, FileText as FileTextIcon, ShareNetwork
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumePreview from './ResumePreview';

const TEMPLATES = [
  { id: 'modern', name: 'Modern Dark', desc: 'Clean, professional & impact-oriented' },
  { id: 'minimal', name: 'Minimalist', desc: 'Focus on content with clean typography' },
  { id: 'classic', name: 'Classic White', desc: 'Traditional recruiter-favorite layout' },
  { id: 'creative', name: 'Creative', desc: 'Bold sidebar and accent colors' },
  { id: 'executive', name: 'Executive', desc: 'Sophisticated layout for senior roles' }
];

const THEME_COLORS = [
  '#00E5FF', // Cyan
  '#7C3AED', // Violet
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#FFFFFF', // White
];

export default function ResumeBuilder() {
  const store = useBuilderStore();
  const [loading, setLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [txtLoading, setTxtLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [bulletGeneratingId, setBulletGeneratingId] = useState<string | null>(null);

  // Load existing resume on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await getBuilderResume();
        if (data && Object.keys(data).length > 0) {
          store.setAll(data);
        }
      } catch (err) {
        console.error("Failed to load resume", err);
      }
    };
    loadResume();
  }, []);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (store.full_name && store.email) {
        handleSave(true);
      }
    }, 30000); // Auto save every 30 seconds
    return () => clearTimeout(timer);
  }, [store]);

  const handleSave = async (isAuto = false) => {
    if (!isAuto) setSaving(true);
    try {
      await saveBuilderResume(store);
      setLastSaved(new Date().toLocaleTimeString());
      
      // Refresh to get public_id if it was just created
      if (!store.public_id) {
        const data = await getBuilderResume();
        if (data.public_id) store.updateField('public_id', data.public_id);
      }
    } catch (err) {
      if (!isAuto) alert("Failed to save resume");
    } finally {
      if (!isAuto) setSaving(false);
    }
  };

  const handleSharePublic = async () => {
    setIsSharing(true);
    try {
      const { share_url } = await shareBuilderResume();
      await navigator.clipboard.writeText(share_url);
      alert('Public resume link copied to clipboard!');
    } catch (err) {
      console.error('Failed to share!', err);
      alert("Failed to generate share link. Please save your resume first.");
    }
    setTimeout(() => setIsSharing(false), 2000);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await generateBuilderPDF(store);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${store.full_name.replace(/\s+/g, '_')}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    setDocLoading(true);
    try {
      const blob = await generateBuilderDOCX(store);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${store.full_name.replace(/\s+/g, '_')}_Resume.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to generate DOCX.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleDownloadTxt = async () => {
    setTxtLoading(true);
    try {
      const blob = await generateBuilderTXT(store);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${store.full_name.replace(/\s+/g, '_')}_Resume.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to generate TXT.");
    } finally {
      setTxtLoading(false);
    }
  };

  const handleAiSummary = async () => {
    setAiGenerating(true);
    try {
      const res = await generateAISummary({
        full_name: store.full_name,
        skills: store.skills,
        experience: store.experience.filter(exp => exp.job_title)
      });
      store.updateField('summary', res.summary);
    } catch (err) {
      alert("Failed to generate AI summary.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiBullets = async (expId: string, title: string, company: string) => {
    if (!title || !company) {
        alert("Please enter job title and company first.");
        return;
    }
    setBulletGeneratingId(expId);
    try {
        const res = await generateBulletPoints({ job_title: title, company });
        const formattedBullets = res.bullet_points.map((b: string) => `• ${b}`).join('\n');
        store.updateExperience(expId, 'description', formattedBullets);
    } catch (err) {
        alert("Failed to generate bullet points.");
    } finally {
        setBulletGeneratingId(null);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      store.addSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Resume Builder</h1>
          <p className="text-text-muted">Create a professional resume in minutes with AI assistance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 mr-4 text-xs text-text-muted">
            {saving ? (
              <span className="animate-pulse">Saving...</span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1"><CheckCircle className="text-brand-success" /> Last saved: {lastSaved}</span>
            ) : null}
          </div>
          
          <button onClick={handleSharePublic} className="glass-card border-brand-warning/30 text-brand-warning !py-2 !px-4 flex items-center gap-2 font-bold transition-all hover:bg-brand-warning/10">
            <ShareNetwork size={20} weight={isSharing ? "fill" : "bold"} />
            {isSharing ? 'Copied!' : 'Share Link'}
          </button>

          <button onClick={() => handleSave()} disabled={saving} className="glass-card !bg-white/5 border-white/10 px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition-all text-white">
            <CloudArrowUp size={20} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          
          <button onClick={handleDownloadTxt} disabled={txtLoading || !store.full_name} className="glass-card border-white/10 !bg-white/5 text-text-muted !py-2 !px-4 flex items-center gap-2 font-bold transition-all hover:bg-white/10">
            {txtLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileTextIcon size={20} weight="fill" />}
            TXT
          </button>

          <button onClick={handleDownloadDocx} disabled={docLoading || !store.full_name} className="glass-card border-brand-primary/30 text-brand-primary !py-2 !px-4 flex items-center gap-2 font-bold transition-all hover:bg-brand-primary/10">
            {docLoading ? <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" /> : <FileDoc size={20} weight="fill" />}
            DOCX
          </button>

          <button onClick={handleDownload} disabled={loading || !store.full_name} className="neon-button !py-2 !px-6 flex items-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FilePdf size={20} weight="fill" />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* FORM SIDE */}
        <div className="space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* 0. Resume Style & Customization */}
          <Section title="Resume Style" icon={<PaintBrush size={24} />} color="brand-primary">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-4 ml-1">Select Template</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => store.updateField('template_id', tpl.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        store.template_id === tpl.id 
                          ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                          : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-bold mb-1">{tpl.name}</div>
                      <div className="text-[10px] leading-tight opacity-70">{tpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-4 ml-1">Theme Color</label>
                <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => store.updateField('theme_color', color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${
                        store.theme_color === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 1. Personal Information */}
          <Section title="Personal Information" icon={<User size={24} />} color="brand-primary">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full Name" value={store.full_name} onChange={(val: string) => store.updateField('full_name', val)} placeholder="Muhammad Uzair" />
              <Input label="Email" type="email" value={store.email} onChange={(val: string) => store.updateField('email', val)} placeholder="uzair@example.com" />
              <Input label="Phone" value={store.phone} onChange={(val: string) => store.updateField('phone', val)} placeholder="+92 300 1234567" />
              <Input label="Location" value={store.location} onChange={(val: string) => store.updateField('location', val)} placeholder="Karachi, Pakistan" />
              <Input label="LinkedIn" value={store.linkedin} onChange={(val: string) => store.updateField('linkedin', val)} placeholder="linkedin.com/in/username" icon={<Globe />} />
              <Input label="Portfolio" value={store.portfolio} onChange={(val: string) => store.updateField('portfolio', val)} placeholder="portfolio.com" icon={<Globe />} />
            </div>
          </Section>

          {/* 2. Professional Summary */}
          <Section title="Professional Summary" icon={<MagicWand size={24} />} color="brand-warning" 
                   action={<button onClick={handleAiSummary} disabled={aiGenerating} className="text-[10px] bg-brand-warning/10 text-brand-warning border border-brand-warning/20 px-2 py-1 rounded flex items-center gap-1 hover:bg-brand-warning/20 transition-all">
                             <MagicWand /> {aiGenerating ? 'Generating...' : 'AI Generate ✨'}
                           </button>}>
            <textarea
              value={store.summary}
              onChange={(e) => store.updateField('summary', e.target.value)}
              className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-xl text-text-primary outline-none focus:border-brand-warning/50 resize-none transition-all"
              placeholder="Brief overview of your professional background..."
            />
            <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] text-text-muted">{store.summary.length} characters</span>
                <span className="text-[10px] text-text-muted">Min: 50 | Max: 500</span>
            </div>
          </Section>

          {/* 3. Work Experience */}
          <Section title="Work Experience" icon={<Briefcase size={24} />} color="brand-success"
                   action={<button onClick={store.addExperience} className="p-1.5 bg-brand-success/10 text-brand-success rounded-lg hover:bg-brand-success/20"><Plus weight="bold" /></button>}>
            <div className="space-y-6">
              {store.experience.map((exp) => (
                <div key={exp.id} className="relative p-5 bg-white/5 rounded-2xl border border-white/5 group">
                  <button onClick={() => store.removeExperience(exp.id)} className="absolute -top-2 -right-2 p-1.5 bg-brand-danger/20 text-brand-danger rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash size={14} /></button>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input label="Job Title" value={exp.job_title} onChange={(val: string) => store.updateExperience(exp.id, 'job_title', val)} placeholder="Full Stack Developer" />
                    <Input label="Company" value={exp.company} onChange={(val: string) => store.updateExperience(exp.id, 'company', val)} placeholder="Google" />
                  </div>
                  <Input label="Dates" value={exp.dates} onChange={(val: string) => store.updateExperience(exp.id, 'dates', val)} placeholder="2021 - Present" />
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-text-muted uppercase">Description</label>
                        <button 
                            onClick={() => handleAiBullets(exp.id, exp.job_title, exp.company)}
                            disabled={bulletGeneratingId === exp.id}
                            className="text-[10px] bg-brand-success/10 text-brand-success border border-brand-success/20 px-2 py-1 rounded flex items-center gap-1 hover:bg-brand-success/20 transition-all"
                        >
                            <Sparkle size={12} weight="fill" />
                            {bulletGeneratingId === exp.id ? 'Generating...' : 'AI Bullet Points ✨'}
                        </button>
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => store.updateExperience(exp.id, 'description', e.target.value)}
                      className="w-full h-32 p-3 bg-white/5 border border-white/10 rounded-xl text-text-primary outline-none focus:border-brand-success/50 resize-none text-sm"
                      placeholder="• Built AI powered apps..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 4. Education */}
          <Section title="Education" icon={<GraduationCap size={24} />} color="brand-primary"
                   action={<button onClick={store.addEducation} className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary/20"><Plus weight="bold" /></button>}>
            <div className="space-y-6">
              {store.education.map((edu) => (
                <div key={edu.id} className="relative p-5 bg-white/5 rounded-2xl border border-white/5 group">
                  <button onClick={() => store.removeEducation(edu.id)} className="absolute -top-2 -right-2 p-1.5 bg-brand-danger/20 text-brand-danger rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash size={14} /></button>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input label="Degree" value={edu.degree} onChange={(val: string) => store.updateEducation(edu.id, 'degree', val)} placeholder="BS Computer Science" />
                    <Input label="School/University" value={edu.school} onChange={(val: string) => store.updateEducation(edu.id, 'school', val)} placeholder="FAST University" />
                  </div>
                  <Input label="Dates" value={edu.dates} onChange={(val: string) => store.updateEducation(edu.id, 'dates', val)} placeholder="2019 - 2023" />
                </div>
              ))}
            </div>
          </Section>

          {/* 5. Skills */}
          <Section title="Skills" icon={<Wrench size={24} />} color="brand-secondary">
             <div className="relative">
                <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="Type skill and press Enter (e.g. Next.js)"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-text-primary outline-none focus:border-brand-secondary/50"
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    <AnimatePresence>
                        {store.skills.map((skill) => (
                            <motion.span
                                key={skill}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="px-3 py-1.5 bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 rounded-lg text-sm flex items-center gap-2"
                            >
                                {skill}
                                <button onClick={() => store.removeSkill(skill)}><Trash size={14} className="hover:text-brand-danger transition-colors" /></button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>
             </div>
          </Section>

          {/* 6. Projects */}
          <Section title="Projects" icon={<GithubLogo size={24} />} color="brand-info"
                   action={<button onClick={store.addProject} className="p-1.5 bg-brand-info/10 text-brand-info rounded-lg hover:bg-brand-info/20"><Plus weight="bold" /></button>}>
            <div className="space-y-6">
                {store.projects.map((proj) => (
                    <div key={proj.id} className="relative p-5 bg-white/5 rounded-2xl border border-white/5 group">
                        <button onClick={() => store.removeProject(proj.id)} className="absolute -top-2 -right-2 p-1.5 bg-brand-danger/20 text-brand-danger rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash size={14} /></button>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <Input label="Project Name" value={proj.name} onChange={(val: string) => store.updateProject(proj.id, 'name', val)} placeholder="AI Resume Analyzer" />
                            <Input label="Tech Stack" value={proj.tech_stack} onChange={(val: string) => store.updateProject(proj.id, 'tech_stack', val)} placeholder="Next.js, FastAPI, Groq" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <Input label="Live Link" value={proj.live_link} onChange={(val: string) => store.updateProject(proj.id, 'live_link', val)} placeholder="https://..." icon={<Globe />} />
                            <Input label="GitHub Link" value={proj.github_link} onChange={(val: string) => store.updateProject(proj.id, 'github_link', val)} placeholder="https://github..." icon={<GithubLogo />} />
                        </div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2">Description</label>
                        <textarea
                            value={proj.description}
                            onChange={(e) => store.updateProject(proj.id, 'description', e.target.value)}
                            className="w-full h-20 p-3 bg-white/5 border border-white/10 rounded-xl text-text-primary outline-none focus:border-brand-info/50 resize-none text-sm"
                            placeholder="Describe your project..."
                        />
                    </div>
                ))}
            </div>
          </Section>

          {/* 7. Certifications */}
          <Section title="Certifications" icon={<Certificate size={24} />} color="brand-success"
                   action={<button onClick={store.addCertification} className="p-1.5 bg-brand-success/10 text-brand-success rounded-lg hover:bg-brand-success/20"><Plus weight="bold" /></button>}>
            <div className="space-y-4">
                {store.certifications.map((cert) => (
                    <div key={cert.id} className="relative p-5 bg-white/5 rounded-2xl border border-white/5 group">
                        <button onClick={() => store.removeCertification(cert.id)} className="absolute -top-2 -right-2 p-1.5 bg-brand-danger/20 text-brand-danger rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash size={14} /></button>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <Input label="Name" value={cert.name} onChange={(val: string) => store.updateCertification(cert.id, 'name', val)} placeholder="Agentic AI Diploma" />
                            </div>
                            <div className="md:col-span-1">
                                <Input label="Issuer" value={cert.issuer} onChange={(val: string) => store.updateCertification(cert.id, 'issuer', val)} placeholder="Governor House" />
                            </div>
                            <div className="md:col-span-1">
                                <Input label="Date" value={cert.date} onChange={(val: string) => store.updateCertification(cert.id, 'date', val)} placeholder="2024" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </Section>
        </div>

        {/* PREVIEW SIDE */}
        <div className="sticky top-24 hidden lg:block">
           <div className="flex justify-between items-center mb-4 px-2">
             <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
               <DownloadSimple className="text-brand-primary" /> Live Preview
             </h3>
             <span className="text-[10px] uppercase tracking-widest text-text-muted bg-white/5 px-2 py-1 rounded border border-white/10">A4 Standard Format</span>
           </div>
           <div className="max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar shadow-2xl rounded-xl">
             <ResumePreview />
           </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children, action, color }: any) {
    return (
        <section className="glass-card p-6 border-white/5">
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-heading font-bold flex items-center gap-3 text-${color}`}>
                    {icon}
                    {title}
                </h3>
                {action}
            </div>
            {children}
        </section>
    );
}

function Input({ label, value, onChange, placeholder, type = "text", icon }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">{label}</label>
            <div className="relative">
                {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">{icon}</div>}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full p-3 bg-white/5 border border-white/10 rounded-xl text-text-primary outline-none focus:border-brand-primary/50 transition-all text-sm ${icon ? 'pl-10' : ''}`}
                />
            </div>
        </div>
    );
}

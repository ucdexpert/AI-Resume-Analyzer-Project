'use client';

import React from 'react';
import useBuilderStore from '@/stores/useBuilderStore';
import { Globe, GithubLogo, Envelope, Phone, MapPin } from '@phosphor-icons/react';

export default function ResumePreview() {
  const store = useBuilderStore();
  const themeColor = store.theme_color || '#00E5FF';

  const renderTemplate = () => {
    switch (store.template_id) {
      case 'minimal': return <MinimalTemplate store={store} themeColor={themeColor} />;
      case 'classic': return <ClassicTemplate store={store} themeColor={themeColor} />;
      case 'creative': return <CreativeTemplate store={store} themeColor={themeColor} />;
      case 'executive': return <ExecutiveTemplate store={store} themeColor={themeColor} />;
      default: return <ModernTemplate store={store} themeColor={themeColor} />;
    }
  };

  return (
    <div className="bg-white w-full aspect-[210/297] text-[#1A1A1A] overflow-hidden shadow-inner origin-top transition-all">
      {renderTemplate()}
    </div>
  );
}

// --- Sub-Templates ---

function ModernTemplate({ store, themeColor }: any) {
  return (
    <div className="h-full flex flex-col p-10">
      <header className="border-b-4 pb-6 mb-6" style={{ borderColor: themeColor }}>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">{store.full_name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 uppercase">
          <span className="flex items-center gap-1"><Envelope size={12} style={{ color: themeColor }} /> {store.email || 'email@example.com'}</span>
          <span className="flex items-center gap-1"><Phone size={12} style={{ color: themeColor }} /> {store.phone || 'Phone'}</span>
          <span className="flex items-center gap-1"><MapPin size={12} style={{ color: themeColor }} /> {store.location || 'Location'}</span>
          {store.linkedin && <span className="flex items-center gap-1"><Globe size={12} style={{ color: themeColor }} /> LinkedIn</span>}
        </div>
      </header>

      <div className="flex-1 overflow-hidden space-y-6">
        {store.summary && (
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: themeColor }}>Summary</h3>
            <p className="text-[10px] leading-relaxed text-gray-700">{store.summary}</p>
          </section>
        )}

        <section>
          <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: themeColor }}>Experience</h3>
          <div className="space-y-4">
            {store.experience.map((exp: any) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-[11px] font-bold">{exp.job_title || 'Job Title'}</h4>
                  <span className="text-[9px] font-bold text-gray-400">{exp.dates || 'Dates'}</span>
                </div>
                <div className="text-[10px] font-bold mb-1" style={{ color: themeColor }}>{exp.company || 'Company'}</div>
                <p className="text-[9px] leading-relaxed text-gray-600 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-8">
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: themeColor }}>Education</h3>
            {store.education.map((edu: any) => (
              <div key={edu.id} className="mb-2">
                <div className="text-[10px] font-bold">{edu.degree || 'Degree'}</div>
                <div className="text-[9px] text-gray-600">{edu.school || 'School'}</div>
                <div className="text-[8px] text-gray-400">{edu.dates}</div>
              </div>
            ))}
          </section>
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: themeColor }}>Skills</h3>
            <div className="flex flex-wrap gap-1">
              {store.skills.map((skill: string) => (
                <span key={skill} className="px-2 py-0.5 bg-gray-100 text-[9px] font-bold rounded">{skill}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MinimalTemplate({ store, themeColor }: any) {
  return (
    <div className="h-full p-12 font-serif">
      <center className="mb-10">
        <h1 className="text-3xl font-light tracking-[0.2em] uppercase mb-4">{store.full_name || 'Your Name'}</h1>
        <div className="text-[9px] text-gray-500 tracking-widest uppercase flex justify-center gap-4">
          <span>{store.email}</span>
          <span>{store.phone}</span>
          <span>{store.location}</span>
        </div>
      </center>

      <div className="space-y-8">
        <section>
          <p className="text-[11px] leading-relaxed text-center italic text-gray-600 max-w-xl mx-auto">{store.summary}</p>
        </section>

        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] border-b pb-1 mb-4 text-center">Experience</h2>
          <div className="space-y-6">
            {store.experience.map((exp: any) => (
              <div key={exp.id} className="text-center">
                <h3 className="text-[11px] font-bold uppercase">{exp.job_title}</h3>
                <div className="text-[10px] text-gray-500 mb-2">{exp.company} | {exp.dates}</div>
                <p className="text-[10px] leading-relaxed text-gray-600 max-w-2xl mx-auto">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-12">
           <section>
             <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] border-b pb-1 mb-3">Education</h2>
             {store.education.map((edu: any) => (
               <div key={edu.id} className="mb-3">
                 <div className="text-[11px] font-bold">{edu.degree}</div>
                 <div className="text-[10px] text-gray-600">{edu.school}</div>
               </div>
             ))}
           </section>
           <section>
             <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] border-b pb-1 mb-3">Expertise</h2>
             <div className="flex flex-wrap gap-x-4 gap-y-1">
               {store.skills.map((skill: string) => (
                 <span key={skill} className="text-[10px] text-gray-700">/ {skill}</span>
               ))}
             </div>
           </section>
        </div>
      </div>
    </div>
  );
}

function ClassicTemplate({ store, themeColor }: any) {
    return (
      <div className="h-full p-10 font-sans text-[11px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{store.full_name || 'Your Name'}</h1>
          <div className="text-gray-600 flex justify-center gap-2">
            <span>{store.location}</span> | <span>{store.phone}</span> | <span>{store.email}</span>
          </div>
          {store.linkedin && <div className="text-blue-600 underline text-[10px]">{store.linkedin}</div>}
        </div>

        <div className="space-y-5">
            <section>
                <h2 className="font-bold border-b-2 border-gray-800 uppercase mb-2">Professional Summary</h2>
                <p className="text-gray-700">{store.summary}</p>
            </section>

            <section>
                <h2 className="font-bold border-b-2 border-gray-800 uppercase mb-2">Experience</h2>
                {store.experience.map((exp: any) => (
                    <div key={exp.id} className="mb-3">
                        <div className="flex justify-between font-bold">
                            <span>{exp.company}</span>
                            <span>{exp.dates}</span>
                        </div>
                        <div className="italic mb-1">{exp.job_title}</div>
                        <p className="text-gray-700 whitespace-pre-line pl-2 border-l-2 border-gray-100">{exp.description}</p>
                    </div>
                ))}
            </section>

            <section>
                <h2 className="font-bold border-b-2 border-gray-800 uppercase mb-2">Education</h2>
                {store.education.map((edu: any) => (
                    <div key={edu.id} className="flex justify-between mb-1">
                        <div><span className="font-bold">{edu.school}</span>, {edu.degree}</div>
                        <span className="font-bold">{edu.dates}</span>
                    </div>
                ))}
            </section>

            <section>
                <h2 className="font-bold border-b-2 border-gray-800 uppercase mb-2">Skills</h2>
                <p><strong>Technical Skills:</strong> {store.skills.join(', ')}</p>
            </section>
        </div>
      </div>
    );
}

function CreativeTemplate({ store, themeColor }: any) {
    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-1/3 h-full p-8 text-white flex flex-col" style={{ backgroundColor: themeColor }}>
                <div className="mb-10">
                    <h1 className="text-2xl font-black uppercase leading-none mb-4">{store.full_name || 'Name'}</h1>
                    <div className="space-y-2 text-[9px] opacity-90">
                        <div className="flex items-center gap-2"><Envelope size={12} /> {store.email}</div>
                        <div className="flex items-center gap-2"><Phone size={12} /> {store.phone}</div>
                        <div className="flex items-center gap-2"><MapPin size={12} /> {store.location}</div>
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    <section>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest border-b border-white/30 pb-1 mb-3">Skills</h2>
                        <div className="space-y-1">
                            {store.skills.map((skill: string) => (
                                <div key={skill} className="text-[10px] flex items-center gap-2">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest border-b border-white/30 pb-1 mb-3">Education</h2>
                        {store.education.map((edu: any) => (
                            <div key={edu.id} className="mb-3 last:mb-0">
                                <div className="text-[10px] font-bold">{edu.degree}</div>
                                <div className="text-[9px] opacity-80">{edu.school}</div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 p-10 bg-white">
                <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>About Me</h2>
                    <p className="text-[10px] leading-relaxed text-gray-600">{store.summary}</p>
                </section>

                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Work History</h2>
                    <div className="space-y-6">
                        {store.experience.map((exp: any) => (
                            <div key={exp.id} className="relative pl-4 border-l-2 border-gray-100">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-[11px] font-bold uppercase">{exp.job_title}</h3>
                                    <span className="text-[9px] text-gray-400 font-bold">{exp.dates}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-800 mb-2">{exp.company}</div>
                                <p className="text-[9px] leading-relaxed text-gray-500">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function ExecutiveTemplate({ store, themeColor }: any) {
    return (
        <div className="h-full p-12 flex flex-col font-serif">
            <header className="flex justify-between items-end mb-8 border-b-2 pb-6" style={{ borderColor: themeColor }}>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{store.full_name}</h1>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Senior Professional</div>
                </div>
                <div className="text-right text-[9px] space-y-1 text-gray-600">
                    <div>{store.location}</div>
                    <div>{store.phone}</div>
                    <div>{store.email}</div>
                    {store.linkedin && <div style={{ color: themeColor }}>{store.linkedin}</div>}
                </div>
            </header>

            <div className="flex-1 overflow-hidden space-y-8">
                <section className="flex gap-10">
                    <div className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-widest" style={{ color: themeColor }}>Profile</div>
                    <p className="flex-1 text-[11px] leading-relaxed text-gray-700">{store.summary}</p>
                </section>

                <section className="flex gap-10">
                    <div className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-widest" style={{ color: themeColor }}>Experience</div>
                    <div className="flex-1 space-y-6">
                        {store.experience.map((exp: any) => (
                            <div key={exp.id}>
                                <div className="flex justify-between font-bold text-[11px] mb-1">
                                    <span>{exp.job_title}</span>
                                    <span>{exp.dates}</span>
                                </div>
                                <div className="text-[10px] italic text-gray-600 mb-2">{exp.company}</div>
                                <p className="text-[10px] leading-relaxed text-gray-600">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex gap-10">
                    <div className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-widest" style={{ color: themeColor }}>Competencies</div>
                    <div className="flex-1 flex flex-wrap gap-x-6 gap-y-2">
                        {store.skills.map((skill: string) => (
                            <span key={skill} className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">{skill}</span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

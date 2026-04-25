'use client'
import React from 'react'
import useBuilderStore from '@/stores/useBuilderStore'

export default function ResumePreview() {
  const data = useBuilderStore()

  return (
    <div className="bg-white text-black p-8 min-h-[1056px] w-full max-w-[816px] shadow-2xl mx-auto font-sans overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900">{data.full_name || 'Your Name'}</h1>
        <div className="text-xs text-gray-600 mt-2 space-x-2">
          <span>{data.email || 'email@example.com'}</span>
          {data.phone && <span> | {data.phone}</span>}
          {data.location && <span> | {data.location}</span>}
        </div>
        <div className="text-xs text-gray-600 mt-1 space-x-2">
          {data.linkedin && <span>LinkedIn: {data.linkedin}</span>}
          {data.portfolio && <span>Portfolio: {data.portfolio}</span>}
        </div>
      </div>

      <div className="border-t-2 border-blue-600 mb-6"></div>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest border-b border-gray-200 mb-2 pb-1">Professional Summary</h2>
          <p className="text-[10pt] leading-relaxed text-gray-800">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && data.experience[0].job_title && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest border-b border-gray-200 mb-2 pb-1">Work Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[11pt] font-bold text-gray-900">{exp.job_title}</h3>
                  <span className="text-[9pt] font-semibold text-gray-600">{exp.dates}</span>
                </div>
                <p className="text-[10pt] font-semibold text-gray-700">{exp.company}</p>
                <p className="text-[10pt] leading-normal text-gray-800 mt-1 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && data.education[0].degree && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest border-b border-gray-200 mb-2 pb-1">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[11pt] font-bold text-gray-900">{edu.degree}</h3>
                  <span className="text-[9pt] font-semibold text-gray-600">{edu.dates}</span>
                </div>
                <p className="text-[10pt] text-gray-700">{edu.school}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest border-b border-gray-200 mb-2 pb-1">Skills</h2>
          <p className="text-[10pt] leading-relaxed text-gray-800">
            {data.skills.join(' • ')}
          </p>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && data.projects[0].name && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest border-b border-gray-200 mb-2 pb-1">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[11pt] font-bold text-gray-900">{proj.name}</h3>
                  <div className="text-[9pt] space-x-2">
                    {proj.github_link && <a href={proj.github_link} className="text-blue-600 underline">GitHub</a>}
                    {proj.live_link && <a href={proj.live_link} className="text-blue-600 underline">Live</a>}
                  </div>
                </div>
                <p className="text-[9pt] font-semibold text-blue-600 mb-1">{proj.tech_stack}</p>
                <p className="text-[10pt] leading-normal text-gray-800">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && data.certifications[0].name && (
        <section>
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest border-b border-gray-200 mb-2 pb-1">Certifications</h2>
          <div className="space-y-1">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between text-[10pt]">
                <span><span className="font-bold">{cert.name}</span> — {cert.issuer}</span>
                <span className="text-gray-600">{cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

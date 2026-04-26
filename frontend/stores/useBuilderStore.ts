import { create } from 'zustand'

interface Experience {
  id: string
  job_title: string
  company: string
  dates: string
  description: string
}

interface Education {
  id: string
  degree: string
  school: string
  dates: string
}

interface Project {
  id: string
  name: string
  tech_stack: string
  live_link: string
  github_link: string
  description: string
}

interface Certification {
    id: string
    name: string
    issuer: string
    date: string
}

interface BuilderState {
  // Personal Info
  full_name: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
  summary: string

  // Design
  template_id: string
  theme_color: string
  public_id: string | null

  // Arrays
  experience: Experience[]
  education: Education[]
  skills: string[]
  projects: Project[]
  certifications: Certification[]

  // Actions
  updateField: (field: string, value: any) => void
  addExperience: () => void
  removeExperience: (id: string) => void
  updateExperience: (id: string, field: string, value: string) => void
  addEducation: () => void
  removeEducation: (id: string) => void
  updateEducation: (id: string, field: string, value: string) => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  addProject: () => void
  removeProject: (id: string) => void
  updateProject: (id: string, field: string, value: string) => void
  addCertification: () => void
  removeCertification: (id: string) => void
  updateCertification: (id: string, field: string, value: string) => void
  setAll: (data: any) => void
  reset: () => void
}

const initialState = {
    full_name: '', email: '', phone: '',
    location: '', linkedin: '', portfolio: '', summary: '',
    template_id: 'modern',
    theme_color: '#00E5FF',
    public_id: null,
    experience: [{ id: '1', job_title: '', company: '', dates: '', description: '' }],
    education: [{ id: '1', degree: '', school: '', dates: '' }],
    skills: [],
    projects: [],
    certifications: []
}

const useBuilderStore = create<BuilderState>((set) => ({
  ...initialState,

  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

  addExperience: () => set((state) => ({
    experience: [...state.experience, {
      id: Date.now().toString(),
      job_title: '', company: '', dates: '', description: ''
    }]
  })),

  removeExperience: (id) => set((state) => ({
    experience: state.experience.filter(e => e.id !== id)
  })),

  updateExperience: (id, field, value) => set((state) => ({
    experience: state.experience.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    )
  })),

  addEducation: () => set((state) => ({
    education: [...state.education, {
      id: Date.now().toString(),
      degree: '', school: '', dates: ''
    }]
  })),

  removeEducation: (id) => set((state) => ({
    education: state.education.filter(edu => edu.id !== id)
  })),

  updateEducation: (id, field, value) => set((state) => ({
    education: state.education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    )
  })),

  addSkill: (skill) => set((state) => {
    if (state.skills.includes(skill)) return state;
    return { skills: [...state.skills, skill] }
  }),

  removeSkill: (skill) => set((state) => ({
    skills: state.skills.filter(s => s !== skill)
  })),

  addProject: () => set((state) => ({
    projects: [...state.projects, {
      id: Date.now().toString(),
      name: '', tech_stack: '', live_link: '',
      github_link: '', description: ''
    }]
  })),

  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  updateProject: (id, field, value) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    )
  })),

  addCertification: () => set((state) => ({
    certifications: [...state.certifications, {
        id: Date.now().toString(),
        name: '', issuer: '', date: ''
    }]
  })),

  removeCertification: (id) => set((state) => ({
    certifications: state.certifications.filter(c => c.id !== id)
  })),

  updateCertification: (id, field, value) => set((state) => ({
    certifications: state.certifications.map(c =>
        c.id === id ? { ...c, [field]: value } : c
    )
  })),

  setAll: (data) => set((state) => ({ ...state, ...data })),
  
  reset: () => set(initialState)
}))

export default useBuilderStore

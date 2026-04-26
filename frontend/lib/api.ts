import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Auto attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage', e);
      }
    }
  }
  return config;
});

// Auto logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 429) {
      if (typeof window !== 'undefined') {
        alert('⚠️ AI limit reached. Please wait a few minutes.');
      }
    }
    return Promise.reject(error);
  }
);

export const analyzeResume = async (file: File, jobDescription?: string, lang: string = 'en') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lang', lang);
  if (jobDescription) {
    formData.append('job_description', jobDescription);
  }

  try {
    const response = await api.post(`/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || 'Failed to analyze resume. Please try again.';
    throw new Error(message);
  }
};

export const generateCoverLetter = async (resumeText: string, jobTitle: string, companyName: string) => {
  try {
    const response = await api.post(`/generate-cover-letter`, {
      resume_text: resumeText,
      job_title: jobTitle,
      company_name: companyName,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to generate cover letter.');
  }
};

export const generateLinkedInSummary = async (resumeText: string) => {
  try {
    const response = await api.post(`/generate-linkedin`, {
      resume_text: resumeText,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to generate LinkedIn summary.');
  }
};

export const improveSection = async (sectionText: string, sectionName: string) => {
  try {
    const response = await api.post(`/improve-section`, {
      section_text: sectionText,
      section_name: sectionName,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to improve section.');
  }
};

export const evaluateAnswer = async (question: string, userAnswer: string, resumeText: string) => {
  try {
    const response = await api.post(`/evaluate-answer`, {
      question,
      user_answer: userAnswer,
      resume_text: resumeText,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to evaluate answer.');
  }
};

export const rewriteResume = async (resumeText: string, style: string) => {
  try {
    const response = await api.post(`/rewrite-resume`, {
      resume_text: resumeText,
      style,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to rewrite resume.');
  }
};

export const getJobMatches = async (resumeText: string) => {
  try {
    const response = await api.post(`/job-matches`, {
      resume_text: resumeText,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to find job matches.');
  }
};

export const generateResumePDF = async (data: any) => {
  try {
    const response = await api.post(`/generate-resume-pdf`, data, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate resume PDF.');
  }
};

export const generateImprovedPDF = async (text: string, filename: string) => {
  try {
    const response = await api.post(`/generate-improved-pdf`, { text, filename }, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate improved PDF.');
  }
};

export const signup = async (data: any) => {
  try {
    const response = await api.post('/auth/signup', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Signup failed');
  }
};

export const login = async (data: any) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to get user info');
  }
};

// --- Resume Builder ---
export const saveBuilderResume = async (data: any) => {
  try {
    const response = await api.post('/builder/save', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to save resume');
  }
};

export const getBuilderResume = async () => {
  try {
    const response = await api.get('/builder/get');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch resume');
  }
};

export const generateBuilderPDF = async (data: any) => {
  try {
    const response = await api.post('/builder/generate-pdf', data, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate PDF');
  }
};

export const generateBuilderDOCX = async (data: any) => {
  try {
    const response = await api.post('/builder/generate-docx', data, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate DOCX');
  }
};

export const generateBuilderTXT = async (data: any) => {
  try {
    const response = await api.post('/builder/generate-txt', data, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate TXT');
  }
};

export const generateAISummary = async (data: any) => {
  try {
    const response = await api.post('/builder/ai-summary', data);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate AI summary');
  }
};

export const generateBulletPoints = async (data: any) => {
  try {
    const response = await api.post('/builder/ai-bullet-points', data);
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate AI bullet points');
  }
};

export const getAnalysisHistory = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch analysis history.');
  }
};

export const generateAnalysisReport = async (analysisData: any) => {
  try {
    const response = await api.post('/generate-report', { analysis_data: analysisData }, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Failed to generate analysis report');
  }
};

export default api;

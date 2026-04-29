import os
from groq import Groq
from dotenv import load_dotenv
import json
from fastapi import HTTPException

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def analyze_resume_with_ai(resume_text: str, job_description: str = None, lang: str = 'en'):
    """
    Sends resume text and optional job description to Groq LLM for comprehensive analysis in requested language.
    """
    jd_context = f"\nJob Description to match against:\n{job_description}" if job_description else ""
    
    language_map = {
        'en': 'English',
        'ur': 'Urdu',
        'ar': 'Arabic'
    }
    target_lang = language_map.get(lang, 'English')

    prompt = f"""
    You are an expert HR and Resume Analyst. Analyze the following resume text and provide a detailed report in JSON format.
    IMPORTANT: Provide all text descriptions, strengths, weaknesses, suggestions, and feedback in {target_lang}.
    
    Resume Text:
    {resume_text}
    {jd_context}
    
    The JSON response must include:
    1. overall_score (0-100, integer)
    2. score_breakdown: formatting, skills, experience, education, summary (all 0-20, integers)
    3. strengths (array of 3 strings)
    4. weaknesses (array of 3 strings)
    5. suggestions (array of 5 strings)
    6. ats_score (0-100, integer)
    7. ats_tips (array of 3 strings)
    8. section_checker: array of objects with "name" (string) and "exists" (boolean)
    9. missing_keywords: object with "technical_skills", "soft_skills", "industry_terms" (all arrays of strings)
    10. industry_feedback: string with specific feedback based on the candidate's primary industry
    11. salary_estimate: object with "range" (string), "currency" (string "PKR"), and "basis" (string "Market rates in Pakistan")
    12. career_path: object with "short_term" (array of strings) and "long_term" (array of strings)
    13. interview_questions: array of 3 objects, each with properties: "question" (the interview question text), "category" (technical/behavioral/etc.), "suggested_answer" (sample good answer)
    14. match_percentage (integer 0-100, if JD provided)
    15. matched_keywords (array of strings, if JD provided)
    
    IMPORTANT: 
    - Salary must be estimated in PKR (Pakistani Rupee) based on the Pakistan job market.
    - career_path.short_term and career_path.long_term must be ARRAYS of strings.
    Ensure the JSON is valid and strictly follows this structure with correct data types.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)

        # Define allowed keys based on AnalysisResponse model
        allowed_keys = {
            'overall_score', 'score_breakdown', 'strengths', 'weaknesses', 'suggestions',
            'ats_score', 'ats_tips', 'section_checker', 'missing_keywords',
            'industry_feedback', 'salary_estimate', 'career_path', 'interview_questions',
            'match_percentage', 'matched_keywords', 'raw_text'
        }

        # Filter out unexpected top-level keys
        filtered_response_data = {k: v for k, v in response_data.items() if k in allowed_keys}
        response_data = filtered_response_data
        
        # Ensure section_checker exists
        if 'section_checker' not in response_data:
            response_data['section_checker'] = [
                {"name": "Contact Info", "exists": True},
                {"name": "Summary", "exists": True},
                {"name": "Experience", "exists": True},
                {"name": "Education", "exists": True},
                {"name": "Skills", "exists": True},
                {"name": "Projects", "exists": True}
            ]

        # Sanitize list fields to ensure they contain only strings
        list_fields = ['strengths', 'weaknesses', 'suggestions', 'ats_tips', 'matched_keywords']
        for field in list_fields:
            if field in response_data and isinstance(response_data[field], list):
                sanitized_list = []
                for item in response_data[field]:
                    if isinstance(item, str):
                        sanitized_list.append(item)
                    elif isinstance(item, dict):
                        values = [str(v) for v in item.values() if v]
                        sanitized_list.append(" ".join(values))
                    else:
                        sanitized_list.append(str(item))
                response_data[field] = sanitized_list

        # Sanitize career_path to ensure fields are lists of strings
        if 'career_path' in response_data and isinstance(response_data['career_path'], dict):
            cp = response_data['career_path']
            for path_type in ['short_term', 'long_term']:
                if path_type in cp:
                    if isinstance(cp[path_type], str):
                        cp[path_type] = [cp[path_type]]
                    elif isinstance(cp[path_type], list):
                        cp[path_type] = [str(i) for i in cp[path_type]]
                    else:
                        cp[path_type] = [str(cp[path_type])]
                else:
                    cp[path_type] = []
        else:
            response_data['career_path'] = {"short_term": [], "long_term": []}

        # Post-process interview questions to ensure correct format
        if 'interview_questions' in response_data and response_data['interview_questions']:
            fixed_questions = []
            for q in response_data['interview_questions']:
                if isinstance(q, dict):
                    if 'text' in q and 'question' not in q:
                        q['question'] = q.pop('text')
                    if 'question' not in q:
                        q['question'] = 'Sample interview question'
                    if 'category' not in q:
                        q['category'] = 'General'
                    if 'suggested_answer' not in q:
                        q['suggested_answer'] = 'Please provide a thoughtful answer based on your experience.'
                    fixed_questions.append(q)
            response_data['interview_questions'] = fixed_questions[:3]
        
        return response_data
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error calling Groq API for analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_cover_letter(resume_text: str, job_title: str, company_name: str):
    """
    Generates a professional cover letter based on resume and job info.
    """
    from datetime import datetime
    current_date = datetime.now().strftime("%B %d, %Y")

    prompt = f"""
    You are an expert career coach. Write a professional, persuasive cover letter.
    
    Date: {current_date}
    Candidate Resume Text:
    {resume_text}
    
    Target Job: {job_title}
    Target Company: {company_name}
    
    The cover letter should:
    1. Include the date {current_date} at the top.
    2. Be tailored to the candidate's experience and the job role.
    3. Use a professional business letter format.
    
    Return the result as a JSON object with a "cover_letter" field.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)
        
        if 'cover_letter' in response_data:
            ls = response_data['cover_letter']
            if isinstance(ls, dict):
                text = ls.get('cover_letter') or ls.get('text') or ls.get('content') or ls.get('letter') or ls.get('body')
                if text and isinstance(text, str) and len(text) > 50:
                    response_data['cover_letter'] = text
                else:
                    parts = []
                    for key in ['date', 'recipient', 'subject', 'greeting', 'introduction', 'body', 'conclusion', 'closing', 'signature']:
                        val = ls.get(key)
                        if val and isinstance(val, str):
                            parts.append(val)
                    
                    if parts:
                        response_data['cover_letter'] = "\n\n".join(parts)
                    else:
                        response_data['cover_letter'] = "\n\n".join([str(v) for v in ls.values() if v])
            elif isinstance(ls, list):
                response_data['cover_letter'] = "\n".join([str(i) for i in ls])
        
        return response_data
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error calling Groq for cover letter: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_linkedin_summary(resume_text: str):
    """
    Generates a LinkedIn bio/summary from resume content.
    """
    prompt = f"""
    Generate a compelling, professional LinkedIn summary (about section) based on this resume content.
    Keep it within 2600 characters. Use a professional yet engaging tone.
    
    Resume:
    {resume_text}
    
    Return as JSON with a "linkedin_summary" field.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)
        
        if 'linkedin_summary' in response_data:
            if isinstance(response_data['linkedin_summary'], dict):
                ls = response_data['linkedin_summary']
                text = ls.get('linkedin_summary') or ls.get('text') or ls.get('summary') or ls.get('content') or ls.get('about')
                if text and isinstance(text, str):
                    response_data['linkedin_summary'] = text
                else:
                    for v in ls.values():
                        if isinstance(v, str) and len(v) > 50:
                            response_data['linkedin_summary'] = v
                            break
            elif isinstance(response_data['linkedin_summary'], list):
                response_data['linkedin_summary'] = "\n".join([str(i) for i in response_data['linkedin_summary']])
        
        return response_data
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error calling Groq for LinkedIn summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def improve_resume_section(section_text: str, section_name: str):
    """
    Rewrites a weak section of a resume to make it more professional and impact-oriented.
    """
    prompt = f"""
    Rewrite the following resume section to be more professional, impact-oriented, and results-driven.
    Use strong action verbs and quantify achievements where possible.
    
    Section Name: {section_name}
    Current Content:
    {section_text}
    
    Return as JSON with "improved_text" field.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error calling Groq for section improvement: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def get_interview_feedback(question: str, user_answer: str, resume_text: str):
    """
    Evaluates a user's answer to an interview question based on their resume.
    """
    prompt = f"""
    You are an expert interviewer. Evaluate the candidate's answer to the following question.
    
    Candidate Resume:
    {resume_text}
    
    Question: {question}
    Candidate's Answer: {user_answer}
    
    Provide a detailed evaluation in JSON format with these exact fields:
    1. "score": (integer 0-10)
    2. "feedback": (single string containing constructive criticism)
    3. "better_answer": (single string containing a model answer tailored to this candidate)
    
    IMPORTANT: "feedback" and "better_answer" must be plain strings, NOT objects or arrays.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)
        
        if 'score' in response_data:
            try:
                response_data['score'] = int(response_data['score'])
            except:
                response_data['score'] = 5
        else:
            response_data['score'] = 5
            
        for field in ['feedback', 'better_answer']:
            if field in response_data:
                if isinstance(response_data[field], list):
                    response_data[field] = " ".join([str(i) for i in response_data[field]])
                elif isinstance(response_data[field], dict):
                    response_data[field] = " ".join([str(v) for v in response_data[field].values()])
                else:
                    response_data[field] = str(response_data[field])
            else:
                response_data[field] = "No feedback provided."
                
        return response_data
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error evaluating answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_bullet_points(job_title: str, company: str, current_description: str = ""):
    """
    Generates 5 powerful, metric-driven bullet points for a job role.
    """
    prompt = f"""
    You are an expert resume writer. Generate 5 powerful, impact-oriented bullet points for the following job role.
    Use strong action verbs and include metrics/quantifiable results where possible.
    
    Job Title: {job_title}
    Company: {company}
    {f"Current Description to improve: {current_description}" if current_description else ""}
    
    Return as JSON with a "bullet_points" field containing an array of 5 strings.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error generating bullet points: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def rewrite_resume(resume_text: str, style: str):
    """
    Rewrites the entire resume based on a selected style.
    Styles: Professional, Creative, Technical, Executive
    """
    prompt = f"""
    You are a master resume rewriter. 
    Rewrite ONLY the following resume using 
    the "{style}" style. Do NOT invent any 
    new information. Keep all facts, 
    companies, dates, and skills exactly 
    as provided. Only improve the language 
    and formatting.
    
    ORIGINAL RESUME TO REWRITE:
    {resume_text}
    
    Format with clear sections:
    ## SECTION NAME
    Content here
    
    RULES:
    - Keep ALL original information accurate
    - Do NOT add fake experience or skills
    - Do NOT change names, dates, companies
    - Maximum 500 words
    - Return ONLY the rewritten resume text
    - No explanations, no JSON
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        return {"rewritten_text": chat_completion.choices[0].message.content}
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error rewriting resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def match_resume_to_jd(resume_text: str, job_description: str):
    """
    Specifically compares a resume against a job description for match percentage and gap analysis.
    """
    prompt = f"""
    You are an expert technical recruiter. Compare the following resume against the job description.
    
    Resume:
    {resume_text}
    
    Job Description:
    {job_description}
    
    Provide a detailed match analysis in JSON format:
    1. "match_percentage": (integer 0-100)
    2. "fit_level": (string "Ready", "Potential", or "Not a Match")
    3. "missing_skills": (list of strings)
    4. "matched_skills": (list of strings)
    5. "recommendations": (list of 3 specific strings)
    6. "application_advice": (string containing an "Apply" or "Don't Apply" recommendation with reason)
    
    Ensure valid JSON.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error matching job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def match_resume_to_jobs(resume_text: str):
    """
    Analyzes resume and suggests top 10 matching job roles with skills gap analysis.
    """
    prompt = f"""
    You are a career growth advisor. Analyze the following resume and suggest the top 10 matching job roles.
    For each role, provide a skills gap analysis.
    
    Resume:
    {resume_text}
    
    Return as JSON with a "job_matches" field containing an array of 10 objects:
    - role_title (string)
    - match_score (0-100)
    - why_match (1 sentence)
    - key_gaps (list of 3 skills to learn)
    
    Ensure valid JSON.
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service is busy. Please try again in a few minutes."
            )
        print(f"Error matching jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))



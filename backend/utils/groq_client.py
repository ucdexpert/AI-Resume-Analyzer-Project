import os
from groq import Groq
from dotenv import load_dotenv
import json

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
    12. career_path: object with "short_term" (string) and "long_term" (string) - single strings, not arrays
    13. interview_questions: array of 3 objects, each with properties: "question" (the interview question text), "category" (technical/behavioral/etc.), "suggested_answer" (sample good answer)
    14. match_percentage (integer 0-100, if JD provided)
    15. matched_keywords (array of strings, if JD provided)
    
    IMPORTANT: 
    - Salary must be estimated in PKR (Pakistani Rupee) based on the Pakistan job market.
    - career_path.short_term and career_path.long_term must be SINGLE strings, not arrays.
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
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)
        
        # Sanitize list fields to ensure they contain only strings (prevents React "Objects are not valid as a React child" errors)
        for field in ['strengths', 'weaknesses', 'suggestions', 'ats_tips']:
            if field in response_data and isinstance(response_data[field], list):
                sanitized_list = []
                for item in response_data[field]:
                    if isinstance(item, str):
                        sanitized_list.append(item)
                    elif isinstance(item, dict):
                        # If AI nested an object (e.g., with keys like "Authentication Approach"), 
                        # join its values into a single string
                        values = [str(v) for v in item.values() if v]
                        sanitized_list.append(" ".join(values))
                    else:
                        sanitized_list.append(str(item))
                response_data[field] = sanitized_list

        # Post-process interview questions to ensure correct format
        if 'interview_questions' in response_data and response_data['interview_questions']:
            fixed_questions = []
            for q in response_data['interview_questions']:
                if isinstance(q, dict):
                    # Fix property name if AI used 'text' instead of 'question'
                    if 'text' in q and 'question' not in q:
                        q['question'] = q.pop('text')
                    # Ensure all required fields exist
                    if 'question' not in q:
                        q['question'] = 'Sample interview question'
                    if 'category' not in q:
                        q['category'] = 'General'
                    if 'suggested_answer' not in q:
                        q['suggested_answer'] = 'Please provide a thoughtful answer based on your experience.'
                    fixed_questions.append(q)
            response_data['interview_questions'] = fixed_questions[:3]  # Limit to 3 questions
        
        return response_data
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return None

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
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)
        
        # Sanitize to ensure cover_letter is a string
        if 'cover_letter' in response_data:
            ls = response_data['cover_letter']
            if isinstance(ls, dict):
                # Try to find a single string that looks like a letter
                text = ls.get('cover_letter') or ls.get('text') or ls.get('content') or ls.get('letter') or ls.get('body')
                if text and isinstance(text, str) and len(text) > 50:
                    response_data['cover_letter'] = text
                else:
                    # If it's a structured object (date, greeting, body, etc.), merge it
                    parts = []
                    for key in ['date', 'recipient', 'subject', 'greeting', 'introduction', 'body', 'conclusion', 'closing', 'signature']:
                        val = ls.get(key)
                        if val and isinstance(val, str):
                            parts.append(val)
                    
                    if parts:
                        response_data['cover_letter'] = "\n\n".join(parts)
                    else:
                        # Final fallback: just join all string values
                        response_data['cover_letter'] = "\n\n".join([str(v) for v in ls.values() if v])
            elif isinstance(ls, list):
                response_data['cover_letter'] = "\n".join([str(i) for i in ls])
        
        return response_data
    except Exception as e:
        print(f"Error calling Groq for cover letter: {e}")
        return None

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
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)
        
        # Sanitize to ensure linkedin_summary is a string
        if 'linkedin_summary' in response_data:
            if isinstance(response_data['linkedin_summary'], dict):
                ls = response_data['linkedin_summary']
                text = ls.get('linkedin_summary') or ls.get('text') or ls.get('summary') or ls.get('content') or ls.get('about')
                if text and isinstance(text, str):
                    response_data['linkedin_summary'] = text
                else:
                    # Get the first string value found in the dict
                    for v in ls.values():
                        if isinstance(v, str) and len(v) > 50:
                            response_data['linkedin_summary'] = v
                            break
            elif isinstance(response_data['linkedin_summary'], list):
                response_data['linkedin_summary'] = "\n".join([str(i) for i in response_data['linkedin_summary']])
        
        return response_data
    except Exception as e:
        print(f"Error calling Groq for LinkedIn summary: {e}")
        return None

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
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error calling Groq for section improvement: {e}")
        return None

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
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        response_data = json.loads(chat_completion.choices[0].message.content)
        
        # Sanitize output
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
        print(f"Error evaluating answer: {e}")
        return None

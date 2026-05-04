import asyncio
from utils.pdf_generator import generate_text_pdf

resume_content = """MUHAMMAD UZAIR
Frontend Developer

CONTACT INFORMATION
Phone: 03170219387
Email: hk202504@gmail.com
Location: Orangi Town, Karachi
GitHub: github.com/ucdexpert
LinkedIn: linkedin.com/in/muhammad-uzair-066733314

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROFESSIONAL SUMMARY

Highly motivated Frontend Developer with hands-on experience in building scalable web
applications utilizing Next.js, TypeScript, and Python. Seeking an internship to gain
practical industry experience and contribute to real-world projects.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EDUCATION

Diploma in Computer Information Technology
Jinnah Polytechnic Institute, Karachi | Completed: 2023

Diploma in Agentic AI
Governor House IT Initiative | In Progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL SKILLS

Frontend Development
Next.js • React.js • TypeScript • JavaScript • Tailwind CSS • HTML • CSS

Backend Development
Python • FastAPI • REST APIs • JWT Authentication

Database Management
NeonDB (PostgreSQL)

AI & Automation
LLM APIs • Prompt Engineering

Tools & Deployment
Git • GitHub • Vercel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECTS

E-Commerce Platform (E-Shop)
https://e-commerce-mu-wheat-87.vercel.app/

• Designed and developed a responsive e-commerce website with cart system and
  product filtering capabilities
• Implemented featured products, discounts, and newsletter functionality
• Integrated backend APIs with PostgreSQL database for storing products and user data
• Technologies: Next.js, TypeScript, Tailwind CSS, Python, FastAPI, NeonDB, Vercel

Smart Task Manager
https://auto-task-manager.vercel.app/

• Developed a task management dashboard with clean, intuitive UI
• Implemented comprehensive task tracking and workflow management features
• Technologies: Next.js, Python, FastAPI, NeonDB (PostgreSQL), Vercel

LLM-Based Chatbot
https://github.com/ucdexpert

• Built an intelligent chatbot using LLM APIs for natural language query handling
• Integrated prompt-based responses with FastAPI backend
• Technologies: Python, FastAPI, LLM APIs, Prompt Engineering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LANGUAGES

English (Fluent) • Urdu (Native)
"""

async def generate():
    try:
        pdf_bytes = generate_text_pdf(resume_content)

        # Save to file
        with open("Muhammad_Uzair_Resume_Professional.pdf", "wb") as f:
            f.write(pdf_bytes)

        print("Professional resume PDF generated successfully!")
        print("Saved as: Muhammad_Uzair_Resume_Professional.pdf")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(generate())

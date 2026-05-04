import sys
sys.path.append('.')

from utils.groq_client import rewrite_resume
from utils.pdf_generator import generate_text_pdf

# Sample resume
test_resume = """
Muhammad Uzair
Phone: 03170219387
Email: hk202504@gmail.com

I am a frontend developer who knows Next.js and Python. I made some websites.

Skills:
Next.js, React, Python, FastAPI

Projects:
- E-commerce website with cart
- Task manager app
- Chatbot using AI

Education:
Diploma in Computer Information Technology, 2023
"""

print("Generating Styled Resume PDFs...")
print("=" * 60)

styles = ["Professional", "Creative", "Technical", "Executive"]

for style in styles:
    print(f"\nProcessing {style} style...")

    try:
        # Get rewritten text from AI
        result = rewrite_resume(test_resume, style)

        if isinstance(result, dict) and 'rewritten_text' in result:
            rewritten_text = result['rewritten_text']
        else:
            rewritten_text = str(result)

        # Generate styled PDF
        pdf_bytes = generate_text_pdf(rewritten_text, style)

        # Save PDF
        filename = f"Final_Test_{style}_Resume.pdf"
        with open(filename, "wb") as f:
            f.write(pdf_bytes)

        print(f"  [OK] Generated: {filename} ({len(pdf_bytes)} bytes)")
        print(f"  Content preview: {rewritten_text[:100]}...")

    except Exception as e:
        print(f"  [ERROR] Error: {e}")

print("\n" + "="*60)
print("All styled PDFs generated!")
print("Check the backend folder for:")
print("  - Final_Test_Professional_Resume.pdf")
print("  - Final_Test_Creative_Resume.pdf")
print("  - Final_Test_Technical_Resume.pdf")
print("  - Final_Test_Executive_Resume.pdf")

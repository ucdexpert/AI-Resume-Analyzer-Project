import sys
sys.path.append('.')

from utils.groq_client import rewrite_resume

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

print("Testing Resume Rewriter with Different Styles")
print("=" * 60)

styles = ["Professional", "Creative", "Technical", "Executive"]

for style in styles:
    print(f"\n{'='*60}")
    print(f"STYLE: {style}")
    print('='*60)

    try:
        result = rewrite_resume(test_resume, style)

        if isinstance(result, dict) and 'rewritten_text' in result:
            text = result['rewritten_text']
        else:
            text = str(result)

        # Show first 500 characters
        preview = text[:500] + "..." if len(text) > 500 else text
        print(preview)

    except Exception as e:
        print(f"Error: {e}")

print("\n" + "="*60)
print("Test completed!")

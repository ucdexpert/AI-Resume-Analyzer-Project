from utils.pdf_generator import generate_text_pdf

# Test resume text
test_resume = """## CONTACT INFORMATION
MUHAMMAD UZAIR
Phone: 03170219387
Email: hk202504@gmail.com
Location: Orangi Town, Karachi

## PROFESSIONAL SUMMARY
Highly motivated Frontend Developer with hands-on experience in building scalable web applications utilizing Next.js, TypeScript, and Python.

## TECHNICAL SKILLS
Frontend Development: Next.js, React.js, TypeScript, JavaScript, Tailwind CSS
Backend Development: Python, FastAPI, REST APIs, JWT Authentication
Database Management: NeonDB (PostgreSQL)

## PROJECTS
* E-Commerce Platform (E-Shop)
- Designed and developed a responsive e-commerce website
- Implemented featured products and discounts
- Technologies: Next.js, TypeScript, Tailwind CSS, Python

## EDUCATION
Diploma in Computer Information Technology
Jinnah Polytechnic Institute, Karachi | Completed: 2023
"""

# Generate PDFs for all styles
styles = ["Professional", "Creative", "Technical", "Executive"]

for style in styles:
    print(f"Generating {style} style PDF...")
    pdf_bytes = generate_text_pdf(test_resume, style)

    filename = f"Test_Resume_{style}.pdf"
    with open(filename, "wb") as f:
        f.write(pdf_bytes)

    print(f"  Saved: {filename} ({len(pdf_bytes)} bytes)")

print("\nAll test PDFs generated successfully!")

from fpdf import FPDF
import io

class ResumePDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Replace common unicode characters that fpdf2 (with default fonts) doesn't like
    replacements = {
        "\u2013": "-", # en dash
        "\u2014": "-", # em dash
        "\u2018": "'", # left single quote
        "\u2019": "'", # right single quote
        "\u201c": '"', # left double quote
        "\u201d": '"', # right double quote
        "\u2022": "*", # bullet point
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    # Fallback: encode to latin-1 and ignore errors, then decode back to ensure compatibility
    return text.encode("latin-1", errors="ignore").decode("latin-1")

def generate_resume_pdf(data: dict) -> bytes:
    pdf = ResumePDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header - Name and Contact
    pdf.set_font('helvetica', 'B', 24)
    pdf.cell(0, 10, clean_text(data.get('name', 'Your Name')), ln=True, align='C')
    
    pdf.set_font('helvetica', '', 10)
    contact_info = f"{data.get('email', '')} | {data.get('phone', '')} | {data.get('location', '')}"
    pdf.cell(0, 10, clean_text(contact_info), ln=True, align='C')
    
    if data.get('linkedin') or data.get('portfolio'):
        links = f"{data.get('linkedin', '')} {data.get('portfolio', '')}"
        pdf.cell(0, 5, clean_text(links), ln=True, align='C')
    
    pdf.ln(10)

    # Summary
    if data.get('summary'):
        pdf.set_font('helvetica', 'B', 14)
        pdf.cell(0, 10, 'PROFESSIONAL SUMMARY', ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        pdf.set_font('helvetica', '', 11)
        pdf.multi_cell(0, 6, clean_text(data.get('summary')))
        pdf.ln(5)

    # Experience
    if data.get('experience'):
        pdf.set_font('helvetica', 'B', 14)
        pdf.cell(0, 10, 'WORK EXPERIENCE', ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        for exp in data['experience']:
            pdf.set_font('helvetica', 'B', 12)
            title_company = f"{exp.get('title')} at {exp.get('company')}"
            pdf.cell(0, 7, clean_text(title_company), ln=False)
            pdf.set_font('helvetica', 'I', 10)
            pdf.cell(0, 7, clean_text(exp.get('dates')), ln=True, align='R')
            
            pdf.set_font('helvetica', '', 10)
            pdf.multi_cell(0, 5, clean_text(exp.get('description')))
            pdf.ln(3)

    # Education
    if data.get('education'):
        pdf.set_font('helvetica', 'B', 14)
        pdf.cell(0, 10, 'EDUCATION', ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        for edu in data['education']:
            pdf.set_font('helvetica', 'B', 12)
            pdf.cell(0, 7, clean_text(edu.get('degree')), ln=False)
            pdf.set_font('helvetica', 'I', 10)
            pdf.cell(0, 7, clean_text(edu.get('dates')), ln=True, align='R')
            pdf.set_font('helvetica', '', 11)
            pdf.cell(0, 6, clean_text(edu.get('school')), ln=True)
            pdf.ln(2)

    # Skills
    if data.get('skills'):
        pdf.ln(5)
        pdf.set_font('helvetica', 'B', 14)
        pdf.cell(0, 10, 'SKILLS', ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        pdf.set_font('helvetica', '', 11)
        pdf.multi_cell(0, 6, clean_text(", ".join(data['skills'])))

    return pdf.output()

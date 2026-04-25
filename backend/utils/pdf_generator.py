from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.units import inch
from reportlab.lib import colors
import io
import json

def generate_resume_pdf(data) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            topMargin=0.5*inch, bottomMargin=0.5*inch,
                            leftMargin=0.7*inch, rightMargin=0.7*inch)

    styles = getSampleStyleSheet()
    
    # Custom Styles
    name_style = ParagraphStyle('Name', fontSize=24, fontName='Helvetica-Bold',
                                 textColor=colors.HexColor('#1a1a2e'), spaceAfter=12)
    
    header_style = ParagraphStyle('Header', fontSize=14, fontName='Helvetica-Bold',
                                   textColor=colors.HexColor('#2563eb'), spaceBefore=12, spaceAfter=6)
    
    normal_style = styles['Normal']
    normal_style.fontSize = 10
    normal_style.leading = 14
    
    italic_style = styles['Italic']
    italic_style.fontSize = 10
    
    story = []

    # ── Header Section ──────────────────
    story.append(Paragraph(data.full_name, name_style))
    
    contact_parts = [data.email]
    if data.phone: contact_parts.append(data.phone)
    if data.location: contact_parts.append(data.location)
    
    contact_text = " | ".join(contact_parts)
    story.append(Paragraph(contact_text, normal_style))
    
    links = []
    if data.linkedin: links.append(f"LinkedIn: {data.linkedin}")
    if data.portfolio: links.append(f"Portfolio: {data.portfolio}")
    if links:
        story.append(Paragraph(" | ".join(links), normal_style))
        
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb')))
    story.append(Spacer(1, 10))

    # ── Professional Summary ─────────────
    if data.summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", header_style))
        story.append(Paragraph(data.summary, normal_style))
        story.append(Spacer(1, 10))

    # ── Work Experience ──────────────────
    if data.experience:
        story.append(Paragraph("WORK EXPERIENCE", header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        for exp in data.experience:
            # Handle both dict and Pydantic object
            exp_dict = exp if isinstance(exp, dict) else exp.dict()
            title_text = f"<b>{exp_dict['job_title']}</b> at <b>{exp_dict['company']}</b>"
            story.append(Paragraph(title_text, normal_style))
            story.append(Paragraph(exp_dict['dates'], italic_style))
            story.append(Paragraph(exp_dict['description'], normal_style))
            story.append(Spacer(1, 8))

    # ── Education ────────────────────────
    if data.education:
        story.append(Paragraph("EDUCATION", header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        for edu in data.education:
            edu_dict = edu if isinstance(edu, dict) else edu.dict()
            story.append(Paragraph(f"<b>{edu_dict['degree']}</b>", normal_style))
            story.append(Paragraph(f"{edu_dict['school']} | {edu_dict['dates']}", normal_style))
            story.append(Spacer(1, 6))

    # ── Skills ───────────────────────────
    if data.skills:
        story.append(Paragraph("SKILLS", header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        skills_text = " • ".join(data.skills)
        story.append(Paragraph(skills_text, normal_style))
        story.append(Spacer(1, 10))

    # ── Projects ─────────────────────────
    if data.projects:
        story.append(Paragraph("PROJECTS", header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        for proj in data.projects:
            proj_dict = proj if isinstance(proj, dict) else proj.dict()
            story.append(Paragraph(f"<b>{proj_dict['name']}</b> ({proj_dict['tech_stack']})", normal_style))
            story.append(Paragraph(proj_dict['description'], normal_style))
            
            links = []
            if proj_dict.get('live_link'): links.append(f"Live: {proj_dict['live_link']}")
            if proj_dict.get('github_link'): links.append(f"GitHub: {proj_dict['github_link']}")
            if links:
                story.append(Paragraph(" | ".join(links), italic_style))
            story.append(Spacer(1, 8))

    # ── Certifications ───────────────────
    if hasattr(data, 'certifications') and data.certifications:
        story.append(Paragraph("CERTIFICATIONS", header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        for cert in data.certifications:
            cert_dict = cert if isinstance(cert, dict) else cert.dict()
            story.append(Paragraph(f"<b>{cert_dict['name']}</b> — {cert_dict['issuer']} ({cert_dict['date']})", normal_style))
            story.append(Spacer(1, 4))

    doc.build(story)
    return buffer.getvalue()

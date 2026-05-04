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

    # Get template and theme from data
    template_id = getattr(data, 'template_id', 'modern')
    theme_color = getattr(data, 'theme_color', '#00E5FF')

    # Template-specific configurations
    template_configs = {
        'modern': {
            'name_size': 24,
            'header_size': 14,
            'bg_color': colors.HexColor('#1a1a2e'),
            'use_sidebar': False,
            'header_align': 0  # left
        },
        'minimal': {
            'name_size': 22,
            'header_size': 12,
            'bg_color': colors.HexColor('#000000'),
            'use_sidebar': False,
            'header_align': 0
        },
        'classic': {
            'name_size': 20,
            'header_size': 13,
            'bg_color': colors.HexColor('#2c3e50'),
            'use_sidebar': False,
            'header_align': 1  # center
        },
        'creative': {
            'name_size': 26,
            'header_size': 16,
            'bg_color': colors.HexColor('#ec4899'),
            'use_sidebar': True,
            'header_align': 0
        },
        'executive': {
            'name_size': 24,
            'header_size': 15,
            'bg_color': colors.HexColor('#7c3aed'),
            'use_sidebar': False,
            'header_align': 1
        }
    }

    config = template_configs.get(template_id, template_configs['modern'])
    primary_color = colors.HexColor(theme_color)

    # Custom Styles based on template
    name_style = ParagraphStyle('Name',
                                fontSize=config['name_size'],
                                fontName='Helvetica-Bold',
                                textColor=primary_color,
                                spaceAfter=12,
                                alignment=config['header_align'])

    header_style = ParagraphStyle('Header',
                                   fontSize=config['header_size'],
                                   fontName='Helvetica-Bold',
                                   textColor=primary_color,
                                   spaceBefore=12,
                                   spaceAfter=6)

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

    # Template-specific divider
    if template_id == 'minimal':
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
    elif template_id == 'creative':
        story.append(HRFlowable(width="50%", thickness=2, color=primary_color))
    else:
        story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color))

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

def generate_text_pdf(text: str, style: str = "Professional") -> bytes:
    """Generate styled PDF based on resume style"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            topMargin=0.5*inch, bottomMargin=0.5*inch,
                            leftMargin=0.7*inch, rightMargin=0.7*inch)

    styles = getSampleStyleSheet()

    # Style-specific color schemes and formatting
    style_config = {
        "Professional": {
            "primary_color": colors.HexColor('#2563eb'),
            "secondary_color": colors.HexColor('#1e40af'),
            "text_color": colors.HexColor('#1a1a2e'),
            "header_size": 14,
            "name_size": 22
        },
        "Creative": {
            "primary_color": colors.HexColor('#ec4899'),
            "secondary_color": colors.HexColor('#f97316'),
            "text_color": colors.HexColor('#1f2937'),
            "header_size": 16,
            "name_size": 26
        },
        "Technical": {
            "primary_color": colors.HexColor('#10b981'),
            "secondary_color": colors.HexColor('#059669'),
            "text_color": colors.HexColor('#111827'),
            "header_size": 13,
            "name_size": 20
        },
        "Executive": {
            "primary_color": colors.HexColor('#7c3aed'),
            "secondary_color": colors.HexColor('#6d28d9'),
            "text_color": colors.HexColor('#0f172a'),
            "header_size": 15,
            "name_size": 24
        }
    }

    config = style_config.get(style, style_config["Professional"])

    # Custom Styles based on selected style
    name_style = ParagraphStyle('Name',
                                fontSize=config["name_size"],
                                fontName='Helvetica-Bold',
                                textColor=config["primary_color"],
                                spaceAfter=12,
                                alignment=1 if style == "Creative" else 0)

    header_style = ParagraphStyle('Header',
                                  fontSize=config["header_size"],
                                  fontName='Helvetica-Bold',
                                  textColor=config["primary_color"],
                                  spaceBefore=14,
                                  spaceAfter=8,
                                  borderWidth=0 if style == "Technical" else 0,
                                  borderColor=config["secondary_color"])

    normal_style = ParagraphStyle('Normal',
                                 fontSize=10,
                                 leading=14,
                                 textColor=config["text_color"],
                                 fontName='Helvetica')

    bold_style = ParagraphStyle('Bold',
                               fontSize=10,
                               leading=14,
                               textColor=config["text_color"],
                               fontName='Helvetica-Bold')

    story = []
    lines = text.split('\n')

    # Add style indicator at top
    style_badge = ParagraphStyle('Badge',
                                fontSize=8,
                                textColor=colors.white,
                                backColor=config["primary_color"],
                                fontName='Helvetica-Bold',
                                alignment=2)

    story.append(Paragraph(f"  {style} Style  ", style_badge))
    story.append(Spacer(1, 10))

    for line in lines:
        line = line.strip()

        if not line:
            story.append(Spacer(1, 8))
            continue

        # Headers (## SECTION)
        if line.startswith('##'):
            header_text = line.replace('##', '').strip()
            story.append(Paragraph(header_text, header_style))

            # Add decorative line for certain styles
            if style in ["Professional", "Executive"]:
                story.append(HRFlowable(width="100%", thickness=1.5, color=config["primary_color"]))
            elif style == "Creative":
                story.append(HRFlowable(width="50%", thickness=2, color=config["secondary_color"]))

            story.append(Spacer(1, 6))

        # Name/Title (first line or all caps)
        elif line.isupper() and len(line.split()) <= 4:
            story.append(Paragraph(line, name_style))

        # Bullet points
        elif line.startswith('*') or line.startswith('-') or line.startswith('•'):
            bullet_text = line.lstrip('*-• ').strip()
            story.append(Paragraph(f"• {bullet_text}", normal_style))

        # Bold text (lines with colons or starting with capital words)
        elif ':' in line and len(line.split(':')[0].split()) <= 3:
            parts = line.split(':', 1)
            formatted = f"<b>{parts[0]}:</b> {parts[1] if len(parts) > 1 else ''}"
            story.append(Paragraph(formatted, normal_style))

        # Normal text
        else:
            story.append(Paragraph(line, normal_style))

    # Add footer with style branding
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
    footer_style = ParagraphStyle('Footer',
                                 fontSize=8,
                                 textColor=colors.grey,
                                 alignment=1)
    story.append(Paragraph(f"Generated with AI Resume Analyzer - {style} Style", footer_style))

    doc.build(story)
    return buffer.getvalue()

def generate_analysis_report_pdf(analysis_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            topMargin=0.5*inch, bottomMargin=0.5*inch,
                            leftMargin=0.7*inch, rightMargin=0.7*inch)

    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle('Title', fontSize=24, fontName='Helvetica-Bold',
                                 textColor=colors.HexColor('#00E5FF'), spaceAfter=20, alignment=1)
    
    section_style = ParagraphStyle('Section', fontSize=16, fontName='Helvetica-Bold',
                                   textColor=colors.HexColor('#1a1a2e'), spaceBefore=15, spaceAfter=10)
    
    normal_style = styles['Normal']
    normal_style.fontSize = 10
    normal_style.leading = 14
    
    score_style = ParagraphStyle('Score', fontSize=40, fontName='Helvetica-Bold',
                                 textColor=colors.HexColor('#00E5FF'), alignment=1)
    
    story = []

    # 1. Report Header
    story.append(Paragraph("AI Resume Analysis Report", title_style))
    story.append(Paragraph(f"Date: {analysis_data.get('created_at', 'N/A')[:10]}", normal_style))
    story.append(Spacer(1, 20))

    # 2. Overall Score
    story.append(Paragraph("Overall Performance Score", section_style))
    story.append(Paragraph(str(analysis_data.get('overall_score', 0)), score_style))
    story.append(Spacer(1, 20))

    # 3. Strengths & Weaknesses
    story.append(Paragraph("Key Strengths", section_style))
    for s in analysis_data.get('strengths', []):
        story.append(Paragraph(f"• {s}", normal_style))
    
    story.append(Paragraph("Areas for Improvement", section_style))
    for w in analysis_data.get('weaknesses', []):
        story.append(Paragraph(f"• {w}", normal_style))
    story.append(Spacer(1, 10))

    # 4. ATS Optimization
    story.append(Paragraph("ATS Compatibility", section_style))
    story.append(Paragraph(f"ATS Score: {analysis_data.get('ats_score', 0)}/100", normal_style))
    for tip in analysis_data.get('ats_tips', []):
        story.append(Paragraph(f"• {tip}", normal_style))
    story.append(Spacer(1, 10))

    # 5. Career Path
    if analysis_data.get('career_path'):
        cp = analysis_data['career_path']
        story.append(Paragraph("Recommended Career Path", section_style))
        if isinstance(cp, dict):
            story.append(Paragraph("<b>Short Term:</b>", normal_style))
            for item in cp.get('short_term', []):
                story.append(Paragraph(f"• {item}", normal_style))
            
            story.append(Spacer(1, 5))
            story.append(Paragraph("<b>Long Term:</b>", normal_style))
            for item in cp.get('long_term', []):
                story.append(Paragraph(f"• {item}", normal_style))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Paragraph("Generated by SkillSense - Professional AI Analysis", normal_style))

    doc.build(story)
    return buffer.getvalue()

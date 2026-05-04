from playwright.async_api import async_playwright
import io

async def generate_html_resume_pdf(data) -> bytes:
    """Generate PDF from HTML templates using Playwright Async API"""

    template_id = getattr(data, 'template_id', 'modern')
    theme_color = getattr(data, 'theme_color', '#00E5FF')

    # Convert data to dict if it's a Pydantic model
    if hasattr(data, 'dict'):
        data_dict = data.dict()
    else:
        data_dict = data

    # Generate HTML based on template
    if template_id == 'minimal':
        html_content = generate_minimal_html(data_dict, theme_color)
    elif template_id == 'classic':
        html_content = generate_classic_html(data_dict, theme_color)
    elif template_id == 'creative':
        html_content = generate_creative_html(data_dict, theme_color)
    elif template_id == 'executive':
        html_content = generate_executive_html(data_dict, theme_color)
    else:
        html_content = generate_modern_html(data_dict, theme_color)

    # Convert HTML to PDF using Playwright Async API
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html_content)
        pdf_bytes = await page.pdf(format='A4', print_background=True)
        await browser.close()

    return pdf_bytes


def generate_modern_html(data, theme_color):
    """Modern Dark Template - matches frontend exactly"""

    experience_html = ""
    for exp in data.get('experience', []):
        experience_html += f"""
        <div class="experience-item">
            <div class="exp-header">
                <h4>{exp.get('job_title', 'Job Title')}</h4>
                <span class="dates">{exp.get('dates', 'Dates')}</span>
            </div>
            <div class="company" style="color: {theme_color};">{exp.get('company', 'Company')}</div>
            <p class="description">{exp.get('description', '')}</p>
        </div>
        """

    education_html = ""
    for edu in data.get('education', []):
        education_html += f"""
        <div class="edu-item">
            <div class="degree">{edu.get('degree', 'Degree')}</div>
            <div class="school">{edu.get('school', 'School')}</div>
            <div class="edu-dates">{edu.get('dates', '')}</div>
        </div>
        """

    skills_html = ""
    for skill in data.get('skills', []):
        skills_html += f'<span class="skill-tag">{skill}</span>'

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Helvetica', 'Arial', sans-serif;
                color: #1A1A1A;
                padding: 40px;
                font-size: 10pt;
            }}
            header {{
                border-bottom: 4px solid {theme_color};
                padding-bottom: 20px;
                margin-bottom: 20px;
            }}
            h1 {{
                font-size: 32pt;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: -1px;
                margin-bottom: 8px;
            }}
            .contact {{
                display: flex;
                gap: 15px;
                font-size: 8pt;
                font-weight: bold;
                color: #666;
                text-transform: uppercase;
            }}
            h3 {{
                font-size: 10pt;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: {theme_color};
                margin-top: 20px;
                margin-bottom: 10px;
            }}
            .summary {{
                font-size: 9pt;
                line-height: 1.6;
                color: #444;
                margin-bottom: 20px;
            }}
            .experience-item {{
                margin-bottom: 15px;
            }}
            .exp-header {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }}
            .exp-header h4 {{
                font-size: 10pt;
                font-weight: bold;
            }}
            .dates {{
                font-size: 8pt;
                font-weight: bold;
                color: #999;
            }}
            .company {{
                font-size: 9pt;
                font-weight: bold;
                margin-bottom: 4px;
            }}
            .description {{
                font-size: 8pt;
                line-height: 1.5;
                color: #555;
                white-space: pre-line;
            }}
            .two-col {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-top: 20px;
            }}
            .edu-item {{
                margin-bottom: 8px;
            }}
            .degree {{
                font-size: 9pt;
                font-weight: bold;
            }}
            .school {{
                font-size: 8pt;
                color: #555;
            }}
            .edu-dates {{
                font-size: 7pt;
                color: #999;
            }}
            .skill-tag {{
                display: inline-block;
                padding: 3px 8px;
                background: #f0f0f0;
                font-size: 8pt;
                font-weight: bold;
                border-radius: 3px;
                margin-right: 4px;
                margin-bottom: 4px;
            }}
        </style>
    </head>
    <body>
        <header>
            <h1>{data.get('full_name', 'Your Name')}</h1>
            <div class="contact">
                <span>✉ {data.get('email', 'email@example.com')}</span>
                <span>☎ {data.get('phone', 'Phone')}</span>
                <span>📍 {data.get('location', 'Location')}</span>
                {f"<span>🌐 LinkedIn</span>" if data.get('linkedin') else ""}
            </div>
        </header>

        {f'<h3>Summary</h3><p class="summary">{data.get("summary", "")}</p>' if data.get('summary') else ''}

        <h3>Experience</h3>
        {experience_html}

        <div class="two-col">
            <div>
                <h3>Education</h3>
                {education_html}
            </div>
            <div>
                <h3>Skills</h3>
                <div>{skills_html}</div>
            </div>
        </div>
    </body>
    </html>
    """


def generate_minimal_html(data, theme_color):
    """Minimalist Template - centered, clean typography"""

    experience_html = ""
    for exp in data.get('experience', []):
        experience_html += f"""
        <div class="exp-item">
            <h3>{exp.get('job_title', 'Job Title')}</h3>
            <div class="exp-meta">{exp.get('company', 'Company')} | {exp.get('dates', 'Dates')}</div>
            <p>{exp.get('description', '')}</p>
        </div>
        """

    education_html = ""
    for edu in data.get('education', []):
        education_html += f"""
        <div class="edu-item">
            <div class="degree">{edu.get('degree', 'Degree')}</div>
            <div class="school">{edu.get('school', 'School')}</div>
        </div>
        """

    skills_html = " / ".join(data.get('skills', []))

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Georgia', 'Times New Roman', serif;
                color: #1A1A1A;
                padding: 50px;
                text-align: center;
            }}
            h1 {{
                font-size: 28pt;
                font-weight: 300;
                letter-spacing: 8px;
                text-transform: uppercase;
                margin-bottom: 15px;
            }}
            .contact {{
                font-size: 8pt;
                color: #666;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin-bottom: 40px;
            }}
            .summary {{
                font-size: 10pt;
                line-height: 1.6;
                font-style: italic;
                color: #555;
                max-width: 600px;
                margin: 0 auto 40px;
            }}
            h2 {{
                font-size: 9pt;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 4px;
                border-bottom: 1px solid #000;
                padding-bottom: 5px;
                margin: 30px 0 20px;
            }}
            .exp-item {{
                margin-bottom: 25px;
            }}
            .exp-item h3 {{
                font-size: 10pt;
                font-weight: bold;
                text-transform: uppercase;
                margin-bottom: 5px;
            }}
            .exp-meta {{
                font-size: 9pt;
                color: #666;
                margin-bottom: 10px;
            }}
            .exp-item p {{
                font-size: 9pt;
                line-height: 1.5;
                color: #555;
                max-width: 700px;
                margin: 0 auto;
            }}
            .two-col {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 50px;
                margin-top: 30px;
                text-align: left;
            }}
            .edu-item {{
                margin-bottom: 12px;
            }}
            .degree {{
                font-size: 10pt;
                font-weight: bold;
            }}
            .school {{
                font-size: 9pt;
                color: #555;
            }}
            .skills {{
                font-size: 9pt;
                color: #444;
            }}
        </style>
    </head>
    <body>
        <h1>{data.get('full_name', 'Your Name')}</h1>
        <div class="contact">
            {data.get('email', '')} • {data.get('phone', '')} • {data.get('location', '')}
        </div>

        {f'<p class="summary">{data.get("summary", "")}</p>' if data.get('summary') else ''}

        <h2>Experience</h2>
        {experience_html}

        <div class="two-col">
            <div>
                <h2>Education</h2>
                {education_html}
            </div>
            <div>
                <h2>Expertise</h2>
                <div class="skills">{skills_html}</div>
            </div>
        </div>
    </body>
    </html>
    """


def generate_classic_html(data, theme_color):
    """Classic White Template - traditional recruiter-favorite"""

    experience_html = ""
    for exp in data.get('experience', []):
        experience_html += f"""
        <div class="exp-item">
            <div class="exp-header">
                <span class="company">{exp.get('company', 'Company')}</span>
                <span class="dates">{exp.get('dates', 'Dates')}</span>
            </div>
            <div class="job-title">{exp.get('job_title', 'Job Title')}</div>
            <p class="description">{exp.get('description', '')}</p>
        </div>
        """

    education_html = ""
    for edu in data.get('education', []):
        education_html += f"""
        <div class="edu-item">
            <span class="school">{edu.get('school', 'School')}</span>, {edu.get('degree', 'Degree')}
            <span class="dates">{edu.get('dates', '')}</span>
        </div>
        """

    skills_text = ", ".join(data.get('skills', []))

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Arial', 'Helvetica', sans-serif;
                color: #1A1A1A;
                padding: 40px;
                font-size: 10pt;
            }}
            .header {{
                text-align: center;
                margin-bottom: 25px;
            }}
            h1 {{
                font-size: 20pt;
                font-weight: bold;
                margin-bottom: 5px;
            }}
            .contact {{
                color: #555;
                font-size: 9pt;
            }}
            .linkedin {{
                color: #0066cc;
                text-decoration: underline;
                font-size: 8pt;
            }}
            h2 {{
                font-size: 10pt;
                font-weight: bold;
                text-transform: uppercase;
                border-bottom: 2px solid #000;
                margin-top: 20px;
                margin-bottom: 10px;
                padding-bottom: 3px;
            }}
            .summary {{
                font-size: 9pt;
                line-height: 1.5;
                color: #444;
                margin-bottom: 15px;
            }}
            .exp-item {{
                margin-bottom: 12px;
            }}
            .exp-header {{
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                margin-bottom: 3px;
            }}
            .job-title {{
                font-style: italic;
                margin-bottom: 5px;
                font-size: 9pt;
            }}
            .description {{
                font-size: 9pt;
                line-height: 1.4;
                color: #444;
                padding-left: 8px;
                border-left: 2px solid #e0e0e0;
                white-space: pre-line;
            }}
            .edu-item {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 9pt;
            }}
            .school {{
                font-weight: bold;
            }}
            .dates {{
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{data.get('full_name', 'Your Name')}</h1>
            <div class="contact">
                {data.get('location', '')} | {data.get('phone', '')} | {data.get('email', '')}
            </div>
            {f'<div class="linkedin">{data.get("linkedin", "")}</div>' if data.get('linkedin') else ''}
        </div>

        {f'<h2>Professional Summary</h2><p class="summary">{data.get("summary", "")}</p>' if data.get('summary') else ''}

        <h2>Experience</h2>
        {experience_html}

        <h2>Education</h2>
        {education_html}

        <h2>Skills</h2>
        <p><strong>Technical Skills:</strong> {skills_text}</p>
    </body>
    </html>
    """


def generate_creative_html(data, theme_color):
    """Creative Template - bold sidebar with accent colors"""

    skills_html = ""
    for skill in data.get('skills', []):
        skills_html += f'<div class="skill-item">• {skill}</div>'

    education_html = ""
    for edu in data.get('education', []):
        education_html += f"""
        <div class="edu-item">
            <div class="degree">{edu.get('degree', 'Degree')}</div>
            <div class="school">{edu.get('school', 'School')}</div>
        </div>
        """

    experience_html = ""
    for exp in data.get('experience', []):
        experience_html += f"""
        <div class="exp-item">
            <div class="exp-header">
                <h3>{exp.get('job_title', 'Job Title')}</h3>
                <span class="dates">{exp.get('dates', 'Dates')}</span>
            </div>
            <div class="company">{exp.get('company', 'Company')}</div>
            <p>{exp.get('description', '')}</p>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Helvetica', 'Arial', sans-serif;
                display: flex;
                height: 297mm;
            }}
            .sidebar {{
                width: 33%;
                background-color: {theme_color};
                color: white;
                padding: 35px;
            }}
            .sidebar h1 {{
                font-size: 20pt;
                font-weight: 900;
                text-transform: uppercase;
                line-height: 1.1;
                margin-bottom: 20px;
            }}
            .sidebar-contact {{
                font-size: 8pt;
                opacity: 0.9;
                margin-bottom: 30px;
            }}
            .sidebar-contact div {{
                margin-bottom: 8px;
            }}
            .sidebar h2 {{
                font-size: 9pt;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                border-bottom: 1px solid rgba(255,255,255,0.3);
                padding-bottom: 5px;
                margin-bottom: 12px;
                margin-top: 30px;
            }}
            .skill-item {{
                font-size: 9pt;
                margin-bottom: 5px;
            }}
            .edu-item {{
                margin-bottom: 12px;
            }}
            .degree {{
                font-size: 9pt;
                font-weight: bold;
            }}
            .school {{
                font-size: 8pt;
                opacity: 0.8;
            }}
            .main {{
                flex: 1;
                padding: 40px;
                background: white;
                color: #1A1A1A;
            }}
            .main h2 {{
                font-size: 10pt;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: {theme_color};
                margin-bottom: 15px;
            }}
            .about {{
                font-size: 9pt;
                line-height: 1.6;
                color: #555;
                margin-bottom: 30px;
            }}
            .exp-item {{
                position: relative;
                padding-left: 15px;
                border-left: 2px solid #e0e0e0;
                margin-bottom: 25px;
            }}
            .exp-item::before {{
                content: '';
                position: absolute;
                left: -5px;
                top: 5px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: {theme_color};
            }}
            .exp-header {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }}
            .exp-header h3 {{
                font-size: 10pt;
                font-weight: bold;
                text-transform: uppercase;
            }}
            .dates {{
                font-size: 8pt;
                color: #999;
                font-weight: bold;
            }}
            .company {{
                font-size: 9pt;
                font-weight: bold;
                color: #333;
                margin-bottom: 8px;
            }}
            .exp-item p {{
                font-size: 8pt;
                line-height: 1.5;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="sidebar">
            <h1>{data.get('full_name', 'Name')}</h1>
            <div class="sidebar-contact">
                <div>✉ {data.get('email', '')}</div>
                <div>☎ {data.get('phone', '')}</div>
                <div>📍 {data.get('location', '')}</div>
            </div>

            <h2>Skills</h2>
            {skills_html}

            <h2>Education</h2>
            {education_html}
        </div>

        <div class="main">
            <h2>About Me</h2>
            <p class="about">{data.get('summary', '')}</p>

            <h2>Work History</h2>
            {experience_html}
        </div>
    </body>
    </html>
    """


def generate_executive_html(data, theme_color):
    """Executive Template - sophisticated layout for senior roles"""

    experience_html = ""
    for exp in data.get('experience', []):
        experience_html += f"""
        <div class="exp-item">
            <div class="exp-header">
                <span class="job-title">{exp.get('job_title', 'Job Title')}</span>
                <span class="dates">{exp.get('dates', 'Dates')}</span>
            </div>
            <div class="company">{exp.get('company', 'Company')}</div>
            <p>{exp.get('description', '')}</p>
        </div>
        """

    skills_html = ""
    for skill in data.get('skills', []):
        skills_html += f'<span class="skill">{skill}</span>'

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: A4; margin: 0; }}
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Georgia', 'Times New Roman', serif;
                color: #1A1A1A;
                padding: 50px;
            }}
            header {{
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-bottom: 2px solid {theme_color};
                padding-bottom: 25px;
                margin-bottom: 35px;
            }}
            h1 {{
                font-size: 28pt;
                font-weight: bold;
                margin-bottom: 5px;
            }}
            .subtitle {{
                font-size: 10pt;
                text-transform: uppercase;
                letter-spacing: 3px;
                color: #666;
            }}
            .header-contact {{
                text-align: right;
                font-size: 8pt;
                color: #555;
                line-height: 1.6;
            }}
            .linkedin {{
                color: {theme_color};
            }}
            .section {{
                display: flex;
                gap: 40px;
                margin-bottom: 30px;
            }}
            .section-label {{
                width: 100px;
                flex-shrink: 0;
                font-size: 9pt;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: {theme_color};
            }}
            .section-content {{
                flex: 1;
            }}
            .profile {{
                font-size: 10pt;
                line-height: 1.6;
                color: #444;
            }}
            .exp-item {{
                margin-bottom: 25px;
            }}
            .exp-header {{
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 10pt;
                margin-bottom: 5px;
            }}
            .company {{
                font-style: italic;
                font-size: 9pt;
                color: #555;
                margin-bottom: 8px;
            }}
            .exp-item p {{
                font-size: 9pt;
                line-height: 1.5;
                color: #555;
            }}
            .skill {{
                display: inline-block;
                font-size: 9pt;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: -0.5px;
                color: #444;
                margin-right: 25px;
                margin-bottom: 8px;
            }}
        </style>
    </head>
    <body>
        <header>
            <div>
                <h1>{data.get('full_name', 'Your Name')}</h1>
                <div class="subtitle">Senior Professional</div>
            </div>
            <div class="header-contact">
                <div>{data.get('location', '')}</div>
                <div>{data.get('phone', '')}</div>
                <div>{data.get('email', '')}</div>
                {f'<div class="linkedin">{data.get("linkedin", "")}</div>' if data.get('linkedin') else ''}
            </div>
        </header>

        <div class="section">
            <div class="section-label">Profile</div>
            <div class="section-content">
                <p class="profile">{data.get('summary', '')}</p>
            </div>
        </div>

        <div class="section">
            <div class="section-label">Experience</div>
            <div class="section-content">
                {experience_html}
            </div>
        </div>

        <div class="section">
            <div class="section-label">Competencies</div>
            <div class="section-content">
                {skills_html}
            </div>
        </div>
    </body>
    </html>
    """

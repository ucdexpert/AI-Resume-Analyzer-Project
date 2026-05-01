import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USER)

def send_email(to_email: str, subject: str, html_content: str):
    if not SMTP_USER or not SMTP_PASS:
        print(f"\n[EMAIL LOG (NO SMTP)] To: {to_email} | Subject: {subject}")
        print(f"Content: {html_content[:100]}...\n")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"SkillSense <{EMAIL_FROM}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_verification_email(name: str, email: str, token: str):
    link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"
    subject = "Verify Your SkillSense Account 🚀"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Welcome to SkillSense, {name}!</h2>
        <p>Thank you for joining our platform. Please verify your email to unlock all features.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{link}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 10px; color: #999; text-align: center;">SkillSense — Professional AI Resume Analyzer</p>
    </div>
    """
    return send_email(email, subject, html)

def send_password_reset_email(name: str, email: str, token: str):
    link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
    subject = "Reset Your SkillSense Password 🔐"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2>Password Reset Request</h2>
        <p>Hi {name}, we received a request to reset your password. Click the button below to set a new one:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{link}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, no action is needed.</p>
    </div>
    """
    return send_email(email, subject, html)

def send_analysis_email(email: str, name: str, score: int):
    subject = f"Your Resume Analysis Result: {score}/100 📊"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Hello {name}!</h2>
        <p>Your resume analysis is complete. You achieved an overall score of:</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 48px; font-weight: bold; color: #3b82f6;">{score}/100</div>
        </div>
        <p>Log in to your dashboard to see the full breakdown, ATS tips, and career suggestions.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Full Report</a>
        </div>
    </div>
    """
    return send_email(email, subject, html)

def send_contact_notification(name: str, email: str, subject: str, message: str):
    admin_email = os.getenv("SMTP_USER")
    mail_subject = f"New Contact Inquiry: {subject}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            {message}
        </div>
    </div>
    """
    return send_email(admin_email, mail_subject, html)

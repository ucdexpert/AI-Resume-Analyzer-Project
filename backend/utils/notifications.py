import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_analysis_email(user_email: str, user_name: str, score: int):
    """
    Sends an email notification when resume analysis is complete.
    """
    if not resend.api_key:
        print("Resend API key not found. Skipping email.")
        return

    try:
        params = {
            "from": "AI Resume Analyzer <onboarding@resend.dev>",
            "to": [user_email],
            "subject": f"Your Resume Analysis is Ready! (Score: {score}/100)",
            "html": f"""
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #00E5FF;">Hello {user_name}!</h2>
                    <p>Great news! Our AI has completed the analysis of your resume.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 14px; color: #666; text-transform: uppercase;">Overall Score</span><br/>
                        <span style="font-size: 48px; font-weight: bold; color: #00E5FF;">{score}</span>
                    </div>

                    <p>You can now view your detailed report, including:</p>
                    <ul>
                        <li>ATS Compatibility Score</li>
                        <li>Detailed Strengths & Weaknesses</li>
                        <li>Job Match Percentage</li>
                        <li>Tailored Interview Questions</li>
                    </ul>

                    <a href="https://airesume.pk/dashboard" style="display: inline-block; background: #00E5FF; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">View Full Dashboard</a>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999;">
                        Best regards,<br/>
                        The AI Resume Analyzer Team
                    </p>
                </div>
            """,
        }
        resend.Emails.send(params)
        print(f"Analysis email sent to {user_email}")
    except Exception as e:
        print(f"Error sending email: {e}")

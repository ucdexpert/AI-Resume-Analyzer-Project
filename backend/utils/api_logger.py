from utils.db import db
from datetime import datetime

async def log_api_usage(user_id: str, endpoint: str, tokens: int, status_code: int = 200, response_time: int = 0):
    """
    Logs API usage (specifically token counts) to the database for analytics.
    """
    try:
        # Check if we are already connected, if not, it depends on how db.execute is used
        # Our db utility seems to handle connection pooling
        await db.execute("""
            INSERT INTO api_usage_logs (user_id, endpoint, tokens_used, status_code, response_time)
            VALUES ($1, $2, $3, $4, $5)
        """, user_id, endpoint, tokens, status_code, response_time)
    except Exception as e:
        print(f"FAILED to log API usage: {e}")

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print("Connecting to database for migration...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("Adding missing columns...")
        
        # Add analysis_count to users
        await conn.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS analysis_count INTEGER DEFAULT 0;
        """)
        
        # Add missing columns to analysis table if they don't exist
        columns_to_add = [
            ("score_breakdown", "JSONB"),
            ("ats_tips", "JSONB"),
            ("suggestions", "JSONB"),
            ("missing_keywords", "JSONB"),
            ("industry_feedback", "TEXT"),
            ("salary_estimate", "JSONB"),
            ("career_path", "JSONB"),
            ("interview_questions", "JSONB")
        ]
        
        for col_name, col_type in columns_to_add:
            await conn.execute(f"ALTER TABLE analysis ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
            
        print("Migration completed successfully!")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate_v4():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    print("Applying v4 migrations (Auth & Security)...")
    try:
        # 1. Reset Tokens Table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS reset_tokens (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
                token           VARCHAR(255) UNIQUE NOT NULL,
                expires_at      TIMESTAMP NOT NULL,
                used            BOOLEAN DEFAULT false,
                created_at      TIMESTAMP DEFAULT NOW()
            );
        """)

        # 2. Email Verification in Users
        await conn.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
        """)

        print("v4 migrations applied successfully!")
    except Exception as e:
        print(f"Error applying migrations: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_v4())

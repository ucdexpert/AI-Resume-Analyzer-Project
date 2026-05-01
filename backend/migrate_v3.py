import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print("Connecting to database for v3 migration (Newsletter)...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("Creating Newsletter table...")
        
        # Newsletter Subscriptions Table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email         VARCHAR(255) UNIQUE NOT NULL,
                status        VARCHAR(20) DEFAULT 'active', -- active, unsubscribed
                created_at    TIMESTAMP DEFAULT NOW()
            );
        """)
            
        print("Migration v3 completed successfully!")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())

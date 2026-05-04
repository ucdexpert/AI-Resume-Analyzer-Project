import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print("Connecting to database for v7.1 migration (User Columns & Analytics)...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # 1. API Usage Logs Table
        print("Creating/Checking api_usage_logs table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS api_usage_logs (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
                endpoint        VARCHAR(100) NOT NULL,
                tokens_used     INTEGER DEFAULT 0,
                response_time   INTEGER,  -- milliseconds
                status_code     INTEGER,
                created_at      TIMESTAMP DEFAULT NOW()
            );
        """)

        # 2. Payments Table
        print("Creating/Checking payments table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
                plan            VARCHAR(50) NOT NULL,
                amount          DECIMAL(10, 2) NOT NULL,
                payment_method  VARCHAR(50),
                transaction_id  VARCHAR(255) UNIQUE,
                status          VARCHAR(20) DEFAULT 'pending',
                notes           TEXT,
                created_at      TIMESTAMP DEFAULT NOW()
            );
        """)

        # 3. Add missing columns to users table
        print("Adding missing columns to users table...")
        await conn.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS analyses_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS monthly_analyses INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free',
            ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;
        """)

        # 4. Sync analysis_count to analyses_count if needed
        # (Assuming analysis_count was the old name)
        try:
            await conn.execute("UPDATE users SET analyses_count = analysis_count WHERE analyses_count = 0 AND analysis_count > 0")
        except:
            pass
            
        print("Migration v7.1 completed successfully!")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())

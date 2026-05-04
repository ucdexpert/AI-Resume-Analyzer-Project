import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print("Connecting to database for v7 migration (API Usage & Payments)...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # 1. API Usage Logs Table
        print("Creating api_usage_logs table...")
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
        print("Creating payments table...")
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

        # 3. Admins Table (if missing)
        print("Ensuring admins table exists...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name            VARCHAR(100) NOT NULL,
                email           VARCHAR(255) UNIQUE NOT NULL,
                password        VARCHAR(255) NOT NULL,
                role            VARCHAR(20) DEFAULT 'moderator',
                is_active       BOOLEAN DEFAULT true,
                last_login      TIMESTAMP,
                created_at      TIMESTAMP DEFAULT NOW()
            );
        """)
            
        print("Migration v7 completed successfully!")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())

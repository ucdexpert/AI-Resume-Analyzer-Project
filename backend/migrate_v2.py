import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print("Connecting to database for v2 migration...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("Creating Support and Contact tables...")
        
        # Support Tickets Table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS support_tickets (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
                subject       VARCHAR(255) NOT NULL,
                message       TEXT NOT NULL,
                priority      VARCHAR(20) DEFAULT 'normal',
                status        VARCHAR(20) DEFAULT 'open',
                admin_reply   TEXT,
                replied_at    TIMESTAMP,
                created_at    TIMESTAMP DEFAULT NOW()
            );
        """)

        # Contact Inquiries Table (Public)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS contact_inquiries (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name          VARCHAR(100) NOT NULL,
                email         VARCHAR(255) NOT NULL,
                subject       VARCHAR(255) NOT NULL,
                message       TEXT NOT NULL,
                status        VARCHAR(20) DEFAULT 'new',
                created_at    TIMESTAMP DEFAULT NOW()
            );
        """)
            
        print("Migration v2 completed successfully!")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())

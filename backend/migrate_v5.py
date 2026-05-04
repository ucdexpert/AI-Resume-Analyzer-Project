import asyncio
from utils.db import db
import datetime

async def migrate():
    print("Running migration v5: Create manual_payments table")
    await db.connect()
    try:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS manual_payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id),
                plan VARCHAR(50) NOT NULL,
                amount INTEGER NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                transaction_id VARCHAR(255) NOT NULL,
                screenshot_url TEXT NOT NULL,
                notes TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected                admin_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Migration v5 completed.")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(migrate())

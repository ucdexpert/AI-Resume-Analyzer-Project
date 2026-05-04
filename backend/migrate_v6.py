import asyncio
from utils.db import db

async def migrate():
    print("Running migration v6: Add notes column to manual_payments table")
    await db.connect()
    try:
        await db.execute("""
            ALTER TABLE manual_payments 
            ADD COLUMN IF NOT EXISTS notes TEXT;
        """)
        print("Migration v6 completed.")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(migrate())

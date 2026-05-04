import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print("Fixing plan_expires_at column to use TIMESTAMP WITH TIME ZONE...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Alter the column to use timezone-aware timestamps
        await conn.execute("""
            ALTER TABLE users
            ALTER COLUMN plan_expires_at TYPE TIMESTAMP WITH TIME ZONE
            USING plan_expires_at AT TIME ZONE 'UTC';
        """)

        print("Column altered successfully!")

        # Verify the change
        result = await conn.fetchrow("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'plan_expires_at'
        """)

        print(f"New column type: {result['data_type']}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())

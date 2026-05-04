import asyncio
from utils.db import db

async def fix_plan_case():
    """
    Fix plan capitalization in users table.
    Normalize all plan values to lowercase for consistency.
    """
    print("Fixing plan capitalization in users table...")
    await db.connect()
    try:
        # Update all users with 'Pro' to 'pro'
        result = await db.execute("""
            UPDATE users
            SET plan = LOWER(plan)
            WHERE plan != LOWER(plan)
        """)
        print(f"Updated plan capitalization: {result}")

        # Show current plan distribution
        plans = await db.fetch("""
            SELECT plan, COUNT(*) as count
            FROM users
            GROUP BY plan
        """)
        print("\nCurrent plan distribution:")
        for p in plans:
            print(f"  {p['plan']}: {p['count']} users")

        print("\nFix completed successfully!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(fix_plan_case())

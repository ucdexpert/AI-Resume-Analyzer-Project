import asyncio
from utils.db import db
from datetime import datetime, timedelta, timezone

async def sync_approved_payments():
    """
    Sync approved manual payments with user plans.
    This fixes cases where payment was approved but user plan wasn't updated due to errors.
    """
    print("Syncing approved manual payments with user plans...")
    await db.connect()
    try:
        # Find all approved manual payments
        approved_payments = await db.fetch("""
            SELECT mp.id, mp.user_id, mp.plan, mp.amount, mp.created_at, u.email, u.plan as current_plan
            FROM manual_payments mp
            JOIN users u ON mp.user_id = u.id
            WHERE mp.status = 'approved'
            ORDER BY mp.created_at DESC
        """)

        if not approved_payments:
            print("No approved payments found.")
            return

        print(f"\nFound {len(approved_payments)} approved payment(s):\n")

        for payment in approved_payments:
            user_id = payment['user_id']
            plan = payment['plan']
            plan_normalized = plan.lower()
            email = payment['email']
            current_plan = payment['current_plan']

            print(f"Payment ID: {payment['id']}")
            print(f"  User: {email}")
            print(f"  Payment Plan: {plan} -> {plan_normalized}")
            print(f"  Current Plan: {current_plan}")

            # Check if user already has the correct plan
            if current_plan == plan_normalized:
                print(f"  Already synced\n")
                continue

            # Calculate expiration
            if plan_normalized == "pro":
                expires_at = datetime.now(timezone.utc) + timedelta(days=30)
            else:
                expires_at = None

            # Update user's plan
            await db.execute("""
                UPDATE users
                SET plan = $1, plan_expires_at = $2
                WHERE id = $3
            """, plan_normalized, expires_at, user_id)

            print(f"  Updated to '{plan_normalized}' (expires: {expires_at})\n")

        print("Sync completed successfully!")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(sync_approved_payments())

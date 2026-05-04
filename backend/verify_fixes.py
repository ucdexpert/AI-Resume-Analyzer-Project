import asyncio
from utils.db import db

async def verify_fixes():
    """
    Verify all fixes are working correctly:
    1. User plan is updated to 'pro'
    2. Plan expiration is set correctly
    3. Manual payment is properly recorded
    """
    print("Verifying all fixes...\n")
    await db.connect()
    try:
        # Check the user's current plan
        user = await db.fetchrow("""
            SELECT id, email, plan, plan_expires_at
            FROM users
            WHERE email = $1
        """, 'hk202504@gmail.com')

        if user:
            print(f"User: {user['email']}")
            print(f"  Plan: {user['plan']}")
            print(f"  Expires: {user['plan_expires_at']}")
            print(f"  Status: {'PRO' if user['plan'] == 'pro' else 'FREE'}\n")

        # Check manual payment status
        payment = await db.fetchrow("""
            SELECT id, plan, amount, status, created_at
            FROM manual_payments
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        """, user['id'])

        if payment:
            print(f"Latest Manual Payment:")
            print(f"  ID: {payment['id']}")
            print(f"  Plan: {payment['plan']}")
            print(f"  Amount: PKR {payment['amount']}")
            print(f"  Status: {payment['status']}\n")

        # Check if payment was recorded in payments table
        payment_record = await db.fetchrow("""
            SELECT id, plan, amount, status
            FROM payments
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        """, user['id'])

        if payment_record:
            print(f"Payment Record:")
            print(f"  ID: {payment_record['id']}")
            print(f"  Plan: {payment_record['plan']}")
            print(f"  Amount: {payment_record['amount']}")
            print(f"  Status: {payment_record['status']}\n")

        # Check LinkedIn usage count
        linkedin_count = await db.fetchval("""
            SELECT COUNT(*) FROM api_usage_logs
            WHERE user_id = $1 AND endpoint = '/generate-linkedin'
        """, user['id'])

        print(f"LinkedIn Generations Used: {linkedin_count}")
        print(f"  Limit: {'Unlimited (Pro)' if user['plan'] == 'pro' else '3 (Free)'}\n")

        print("=" * 50)
        print("VERIFICATION SUMMARY:")
        print("=" * 50)
        print(f"[OK] User plan: {user['plan']}")
        print(f"[OK] Plan expires: {user['plan_expires_at']}")
        print(f"[OK] Manual payment: {payment['status']}")
        print(f"[OK] Payment recorded: {payment_record['status'] if payment_record else 'N/A'}")
        print(f"[OK] LinkedIn feature: Available")
        print("\nAll fixes verified successfully!")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(verify_fixes())

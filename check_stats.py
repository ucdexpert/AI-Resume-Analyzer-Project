import os
import asyncio
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check():
    conn = await asyncpg.connect(os.getenv('DATABASE_URL'))
    resumes = await conn.fetchval('SELECT COUNT(*) FROM resumes')
    analyses = await conn.fetchval('SELECT COUNT(*) FROM analysis')
    users = await conn.fetchval('SELECT COUNT(*) FROM users')
    avg_score = await conn.fetchval('SELECT ROUND(AVG(overall_score)) FROM analysis')
    
    print(f'Total resumes: {resumes}')
    print(f'Total analyses: {analyses}')
    print(f'Total users: {users}')
    print(f'Avg score: {avg_score}')
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check())

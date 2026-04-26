import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        DATABASE_URL = os.getenv("DATABASE_URL")
        self.pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=5,
            max_inactive_connection_lifetime=300,
            statement_cache_size=0,
            command_timeout=60
        )

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def fetch(self, query, *args):
        for attempt in range(3):
            try:
                async with self.pool.acquire() as conn:
                    return await conn.fetch(query, *args)
            except Exception as e:
                if attempt == 2:
                    raise e
                await asyncio.sleep(1)
                try:
                    await self.pool.expire_connections()
                except:
                    pass

    async def fetchrow(self, query, *args):
        for attempt in range(3):
            try:
                async with self.pool.acquire() as conn:
                    return await conn.fetchrow(query, *args)
            except Exception as e:
                if attempt == 2:
                    raise e
                await asyncio.sleep(1)
                try:
                    await self.pool.expire_connections()
                except:
                    pass

    async def execute(self, query, *args):
        for attempt in range(3):
            try:
                async with self.pool.acquire() as conn:
                    return await conn.execute(query, *args)
            except Exception as e:
                if attempt == 2:
                    raise e
                await asyncio.sleep(1)
                try:
                    await self.pool.expire_connections()
                except:
                    pass

    async def fetchval(self, query, *args):
        for attempt in range(3):
            try:
                async with self.pool.acquire() as conn:
                    return await conn.fetchval(query, *args)
            except Exception as e:
                if attempt == 2:
                    raise e
                await asyncio.sleep(1)
                try:
                    await self.pool.expire_connections()
                except:
                    pass

db = Database()

async def get_db():
    return db

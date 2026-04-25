import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def init_db():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    print("Creating tables...")
    try:
        # Users Table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name        VARCHAR(100) NOT NULL,
                email       VARCHAR(255) UNIQUE NOT NULL,
                password    VARCHAR(255) NOT NULL,
                created_at  TIMESTAMP DEFAULT NOW(),
                updated_at  TIMESTAMP DEFAULT NOW()
            );
        """)

        # Resumes Table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
                file_name   VARCHAR(255),
                raw_text    TEXT,
                uploaded_at TIMESTAMP DEFAULT NOW()
            );
        """)

        # Analysis Table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS analysis (
                id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
                resume_id        UUID REFERENCES resumes(id) ON DELETE CASCADE,
                overall_score    INTEGER,
                ats_score        INTEGER,
                strengths        JSONB,
                weaknesses       JSONB,
                suggestions      JSONB,
                missing_keywords JSONB,
                created_at       TIMESTAMP DEFAULT NOW()
            );
        """)

        # Resume Builder Table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS resume_builder (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id       UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

                -- Personal Info
                full_name     VARCHAR(100) NOT NULL,
                email         VARCHAR(255) NOT NULL,
                phone         VARCHAR(20),
                location      VARCHAR(100),
                linkedin      VARCHAR(255),
                portfolio     VARCHAR(255),

                -- Summary
                summary       TEXT,

                -- JSON Arrays
                experience    JSONB,   -- array of experience objects
                education     JSONB,   -- array of education objects
                skills        JSONB,   -- array of skill strings
                projects      JSONB,   -- array of project objects
                certifications JSONB,  -- array of certification objects

                created_at    TIMESTAMP DEFAULT NOW(),
                updated_at    TIMESTAMP DEFAULT NOW()
            );
        """)
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(init_db())

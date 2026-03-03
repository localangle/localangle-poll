import os

import psycopg2
from psycopg2 import extras

# Prefer DATABASE_URL (Neon), fallback to POSTGRES_URL (Vercel)
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

SCHEMA = """
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK(question_type IN ('numeric','multiple_choice','free_text')),
  options TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  response_value TEXT NOT NULL,
  respondent_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(question_id, respondent_id)
);
"""


def get_db():
    """Return a database connection with RealDictCursor for dict-like rows."""
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL or POSTGRES_URL must be set")
    conn = psycopg2.connect(
        DATABASE_URL,
        cursor_factory=extras.RealDictCursor,
    )
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(SCHEMA)
        conn.commit()
    finally:
        conn.close()

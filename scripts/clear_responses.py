#!/usr/bin/env python3
"""Clear all rows from the responses table. Loads .env from project root."""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(project_root, ".env"))

# Import after dotenv loads
from api.database import get_db

if __name__ == "__main__":
    if not os.environ.get("DATABASE_URL") and not os.environ.get("POSTGRES_URL"):
        print("Error: DATABASE_URL or POSTGRES_URL must be set (e.g. in .env)", file=sys.stderr)
        sys.exit(1)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM responses")
        conn.commit()
        print("Responses table cleared.")
    finally:
        conn.close()

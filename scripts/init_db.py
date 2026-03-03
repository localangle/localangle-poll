#!/usr/bin/env python3
"""Create tables in the remote database. Loads .env from project root."""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(project_root, ".env"))

# Import after dotenv loads
from api.database import init_db

if __name__ == "__main__":
    if not os.environ.get("DATABASE_URL") and not os.environ.get("POSTGRES_URL"):
        print("Error: DATABASE_URL or POSTGRES_URL must be set (e.g. in .env)", file=sys.stderr)
        sys.exit(1)
    init_db()
    print("Tables created successfully.")

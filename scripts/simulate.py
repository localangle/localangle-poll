#!/usr/bin/env python3
"""
Simulate N virtual users responding to poll questions.
Votes are scattered over 10-20 second windows.
Uses LLM for plausible answers when OPENAI_API_KEY is set.
"""

import argparse
import os
import random
import sys
import threading
import time
import uuid
from typing import List, Optional

import requests

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


def get_current_question(base_url: str) -> Optional[dict]:
    """Fetch the currently active question from the API."""
    try:
        r = requests.get(f"{base_url.rstrip('/')}/api/current", timeout=15)
        r.raise_for_status()
        data = r.json()
        return data.get("question")
    except Exception as e:
        print(f"[simulate] Error fetching current question: {e}", file=sys.stderr)
        return None


def generate_answer(question: dict, llm_available: bool) -> str | int | list:
    """Generate a plausible answer based on question type."""
    qtype = question.get("question_type", "")
    qtext = question.get("question_text", "")

    if llm_available and os.environ.get("OPENAI_API_KEY"):
        try:
            client = OpenAI()
            if qtype == "numeric":
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Answer with a single number from 1 to 10. Reply with only the number, nothing else."},
                        {"role": "user", "content": f"Rate your response (1-10): {qtext}"},
                    ],
                    timeout=10,
                )
                text = (resp.choices[0].message.content or "").strip()
                n = int("".join(c for c in text if c.isdigit()) or "5")
                return max(1, min(10, n))
            elif qtype == "multiple_choice":
                options = question.get("options") or []
                opts_str = " | ".join(repr(o) for o in options)
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": f"Pick 1 to 3 options. Reply with the EXACT option text(s) from this list, separated by newlines: {opts_str}"},
                        {"role": "user", "content": f"Question: {qtext}\nWhich option(s)?"},
                    ],
                    timeout=10,
                )
                text = (resp.choices[0].message.content or "").strip()
                chosen = []
                seen = set()
                for line in text.split("\n"):
                    line = line.strip().strip('"\'')
                    for opt in options:
                        if opt == line or (opt not in seen and opt.lower() == line.lower()):
                            chosen.append(opt)
                            seen.add(opt)
                            break
                if not chosen:
                    chosen = random.sample(options, k=min(1, len(options)))
                return chosen
            elif qtype == "free_text":
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "Answer in one short sentence, max 50 words. Be concise and natural."},
                        {"role": "user", "content": qtext},
                    ],
                    timeout=10,
                )
                text = (resp.choices[0].message.content or "").strip()[:280]
                return text
        except Exception as e:
            print(f"[simulate] LLM error, using fallback: {e}", file=sys.stderr)

    # Fallback
    if qtype == "numeric":
        return random.randint(1, 10)
    elif qtype == "multiple_choice":
        options = question.get("options") or []
        if not options:
            return []
        k = random.randint(1, min(3, len(options)))
        return random.sample(options, k=k)
    elif qtype == "free_text":
        words = (
            "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor "
            "incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis "
            "nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat "
            "duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore "
            "fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt "
            "in culpa qui officia deserunt mollit anim id est laborum"
        ).split()
        n = random.randint(5, 30)
        return " ".join(random.choices(words, k=n))
    return ""


def submit_response(base_url: str, respondent_id: str, question_id: int, response_value) -> bool:
    """POST a response to the API."""
    url = f"{base_url.rstrip('/')}/api/respond"
    payload = {
        "question_id": question_id,
        "response_value": response_value,
        "respondent_id": respondent_id,
    }
    try:
        r = requests.post(url, json=payload, timeout=10)
        if r.status_code == 201:
            return True
        if r.status_code == 409:
            return False  # Already responded
        print(f"[simulate] Submit failed: {r.status_code} {r.text}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"[simulate] Submit error: {e}", file=sys.stderr)
        return False


def run_simulation(base_url: str, num_users: int, llm_available: bool) -> None:
    """Main simulation loop."""
    respondent_ids = [str(uuid.uuid4()) for _ in range(num_users)]
    last_answered_id = None
    pending_timers: List[threading.Timer] = []
    lock = threading.Lock()

    print(f"[simulate] Starting with {num_users} users. Base URL: {base_url}")
    if llm_available and os.environ.get("OPENAI_API_KEY"):
        print("[simulate] LLM mode: using OpenAI for plausible answers")
    else:
        print("[simulate] Fallback mode: random/placeholder answers")

    while True:
        question = get_current_question(base_url)
        if question:
            qid = question.get("id")
            if qid is not None and qid != last_answered_id:
                print(f"[simulate] New question: {question.get('question_text', '')[:50]}...")
                last_answered_id = qid

                # Cancel any pending timers from a previous run (shouldn't happen)
                with lock:
                    for t in pending_timers:
                        t.cancel()
                    pending_timers.clear()

                def do_submit(rid: str):
                    ans = generate_answer(question, llm_available)
                    ok = submit_response(base_url, rid, qid, ans)
                    if ok:
                        print(f"[simulate] Submitted: {rid[:8]}...")

                for rid in respondent_ids:
                    delay = random.uniform(0, 20)
                    t = threading.Timer(delay, do_submit, args=(rid,))
                    t.daemon = True
                    with lock:
                        pending_timers.append(t)
                    t.start()

                # Wait for all submissions (max 25s)
                time.sleep(25)
                with lock:
                    for t in pending_timers:
                        t.cancel()
                    pending_timers.clear()
        else:
            last_answered_id = None

        time.sleep(2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Simulate poll respondents")
    parser.add_argument("--users", type=int, default=10, help="Number of simulated users")
    parser.add_argument("--base-url", type=str, default="http://localhost:3001", help="API base URL")
    args = parser.parse_args()

    llm_available = OPENAI_AVAILABLE
    if not llm_available:
        print("[simulate] openai package not installed, using fallback mode", file=sys.stderr)

    try:
        run_simulation(args.base_url, args.users, llm_available)
    except KeyboardInterrupt:
        print("\n[simulate] Stopped")


if __name__ == "__main__":
    main()

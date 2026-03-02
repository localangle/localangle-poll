import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from database import get_db, init_db

app = Flask(__name__)
CORS(app)

ADMIN_PIN = os.environ.get("ADMIN_PIN", "1345")

# Initialize database on startup
init_db()


def require_admin_pin(f):
    """Decorator to require valid admin PIN in X-Admin-Pin header."""
    def wrapped(*args, **kwargs):
        pin = request.headers.get("X-Admin-Pin")
        if pin != ADMIN_PIN:
            return jsonify({"error": "Invalid PIN"}), 401
        return f(*args, **kwargs)
    wrapped.__name__ = f.__name__
    return wrapped


def row_to_dict(row):
    """Convert sqlite3.Row to dict."""
    return dict(row) if row else None


def question_to_json(row):
    """Convert question row to JSON-serializable dict."""
    if not row:
        return None
    d = dict(row)
    if d.get("options"):
        d["options"] = json.loads(d["options"]) if isinstance(d["options"], str) else d["options"]
    d["is_active"] = bool(d.get("is_active"))
    return d


# --- Admin endpoints ---

@app.route("/api/admin/verify-pin", methods=["POST"])
def verify_pin():
    data = request.get_json() or {}
    pin = data.get("pin") or request.headers.get("X-Admin-Pin")
    if pin == ADMIN_PIN:
        return jsonify({"ok": True}), 200
    return jsonify({"error": "Invalid PIN"}), 401


@app.route("/api/admin/questions", methods=["GET"])
@require_admin_pin
def list_questions():
    conn = get_db()
    rows = conn.execute(
        "SELECT q.*, COUNT(r.id) as response_count FROM questions q "
        "LEFT JOIN responses r ON q.id = r.question_id "
        "GROUP BY q.id ORDER BY q.display_order, q.id"
    ).fetchall()
    conn.close()
    questions = []
    for row in rows:
        d = question_to_json(row)
        d["response_count"] = row["response_count"]
        questions.append(d)
    return jsonify(questions)


@app.route("/api/admin/questions", methods=["POST"])
@require_admin_pin
def create_question():
    data = request.get_json()
    if not data or not data.get("question_text") or not data.get("question_type"):
        return jsonify({"error": "question_text and question_type required"}), 400

    qtype = data["question_type"]
    if qtype not in ("numeric", "multiple_choice", "free_text"):
        return jsonify({"error": "Invalid question_type"}), 400

    options = None
    if qtype == "multiple_choice":
        opts = data.get("options") or []
        if len(opts) < 2:
            return jsonify({"error": "multiple_choice requires at least 2 options"}), 400
        options = json.dumps(opts)

    conn = get_db()
    max_order = conn.execute("SELECT COALESCE(MAX(display_order), -1) FROM questions").fetchone()[0]
    display_order = data.get("display_order", max_order + 1)

    cursor = conn.execute(
        "INSERT INTO questions (question_text, question_type, options, display_order) VALUES (?, ?, ?, ?)",
        (data["question_text"], qtype, options, display_order),
    )
    conn.commit()
    qid = cursor.lastrowid
    conn.close()

    return jsonify({"id": qid, "message": "Created"}), 201


@app.route("/api/admin/questions/<int:qid>", methods=["PUT"])
@require_admin_pin
def update_question(qid):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400

    conn = get_db()
    existing = conn.execute("SELECT * FROM questions WHERE id=?", (qid,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Question not found"}), 404

    question_text = data.get("question_text") if data.get("question_text") is not None else existing["question_text"]
    question_type = data.get("question_type") if data.get("question_type") is not None else existing["question_type"]
    if question_type == "multiple_choice":
        opts = data.get("options") or []
        if len(opts) < 2:
            conn.close()
            return jsonify({"error": "multiple_choice requires at least 2 options"}), 400
        options = json.dumps(opts)
    else:
        options = None

    conn.execute(
        "UPDATE questions SET question_text=?, question_type=?, options=? WHERE id=?",
        (question_text, question_type, options, qid),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 200


@app.route("/api/admin/questions/<int:qid>", methods=["DELETE"])
@require_admin_pin
def delete_question(qid):
    conn = get_db()
    conn.execute("DELETE FROM questions WHERE id=?", (qid,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 200


@app.route("/api/admin/activate/<int:qid>", methods=["POST"])
@require_admin_pin
def activate_question(qid):
    conn = get_db()
    conn.execute("UPDATE questions SET is_active=0")
    conn.execute("UPDATE questions SET is_active=1 WHERE id=?", (qid,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 200


@app.route("/api/admin/deactivate", methods=["POST"])
@require_admin_pin
def deactivate():
    conn = get_db()
    conn.execute("UPDATE questions SET is_active=0")
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 200


@app.route("/api/admin/reorder", methods=["POST"])
@require_admin_pin
def reorder_questions():
    data = request.get_json()
    if not data or "order" not in data:
        return jsonify({"error": "order array required"}), 400

    conn = get_db()
    for i, qid in enumerate(data["order"]):
        conn.execute("UPDATE questions SET display_order=? WHERE id=?", (i, qid))
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 200


# --- Audience endpoints ---

@app.route("/api/current", methods=["GET"])
def current_question():
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM questions WHERE is_active=1 LIMIT 1"
    ).fetchone()
    conn.close()
    return jsonify({"question": question_to_json(row)})


@app.route("/api/respond", methods=["POST"])
def respond():
    data = request.get_json()
    if not data or "question_id" not in data or "response_value" not in data or "respondent_id" not in data:
        return jsonify({"error": "question_id, response_value, respondent_id required"}), 400

    qid = data["question_id"]
    value = data["response_value"]
    respondent_id = data["respondent_id"]

    conn = get_db()
    active = conn.execute("SELECT id FROM questions WHERE is_active=1 AND id=?", (qid,)).fetchone()
    if not active:
        conn.close()
        return jsonify({"error": "Question not active"}), 400

    try:
        conn.execute(
            "INSERT INTO responses (question_id, response_value, respondent_id) VALUES (?, ?, ?)",
            (qid, value if isinstance(value, str) else json.dumps(value), respondent_id),
        )
        conn.commit()
    except Exception as e:
        if "UNIQUE" in str(e):
            conn.close()
            return jsonify({"error": "Already responded"}), 409
        raise
    conn.close()
    return jsonify({"ok": True}), 201


# --- Display endpoint ---

@app.route("/api/results", methods=["GET"])
def results():
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM questions WHERE is_active=1 LIMIT 1"
    ).fetchone()
    if not row:
        conn.close()
        return jsonify({"question": None, "responses": []})

    question = question_to_json(row)
    responses_rows = conn.execute(
        "SELECT id, response_value, created_at FROM responses WHERE question_id=? ORDER BY created_at",
        (row["id"],),
    ).fetchall()
    conn.close()

    responses = [
        {"id": r["id"], "response_value": r["response_value"], "created_at": r["created_at"]}
        for r in responses_rows
    ]
    return jsonify({"question": question, "responses": responses})

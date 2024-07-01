from flask import Flask, request, jsonify, render_template, send_from_directory
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)

# Connection parameters should be configured appropriately
TREE_DATABASE_URL = "postgresql://postgres:lovecricket@18@localhost/Stats"

def get_db_connection():
    conn = psycopg2.connect(TREE_DATABASE_URL)
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upvote_tree/<int:tree_id>', methods=['POST'])
def upvote_tree(tree_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "UPDATE Stats SET upvotes = upvotes + 1 WHERE id = %s",
            (tree_id,)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return (
            jsonify(
                {"status": "fail", "message": "Failed to upvote the tree", "error": str(e)}
            ),
            500,
        )
    finally:
        cur.close()
        conn.close()
    return jsonify({"status": "success", "message": "Tree upvoted successfully"}), 200

@app.route('/downvote_tree/<int:tree_id>', methods=['POST'])
def downvote_tree(tree_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "UPDATE Stats SET downvotes = downvotes + 1 WHERE id = %s",
            (tree_id,)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return (
            jsonify(
                {"status": "fail", "message": "Failed to downvote the tree", "error": str(e)}
            ),
            500,
        )
    finally:
        cur.close()
        conn.close()
    return jsonify({"status": "success", "message": "Tree downvoted successfully"}), 200

@app.route('/add_tree', methods=['POST'])
def add_tree():
    data = request.get_json()
    tree_name = data.get('tree_name')
    location = data.get('location')
    upvotes = data.get('upvotes', 0)
    downvotes = data.get('downvotes', 0)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO Stats (tree_name, location, upvotes, downvotes) VALUES (%s, %s, %s, %s)",
            (tree_name, location, upvotes, downvotes)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "fail", "message": "Failed to add the tree", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    
    return jsonify({"status": "success", "message": "Tree added successfully"}), 201

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, request, jsonify, render_template, send_from_directory
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)

# Database connection URL
DATABASE_URL = "postgresql://postgres:lovecricket@18@localhost/Stats"

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upvote_tree', methods=['POST'])
def upvote_tree():
    data = request.get_json()
    tree_id = data['id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE Stats SET upvote = upvote + 1 WHERE tree_id = %s", (tree_id,))
        conn.commit()
        return jsonify({"status": "success", "message": "Tree upvoted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "fail", "message": "Failed to upvote the tree", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/downvote_tree', methods=['POST'])
def downvote_tree():
    data = request.get_json()
    tree_id = data['id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE Stats SET downvote = downvote + 1 WHERE tree_id = %s", (tree_id,))
        conn.commit()
        return jsonify({"status": "success", "message": "Tree downvoted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "fail", "message": "Failed to downvote the tree", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)

import psycopg2

TREE_DATABASE_URL = "postgresql://postgres:lovecricket@18@localhost/Voting"

try:
    conn = psycopg2.connect(TREE_DATABASE_URL)
    print("Database connected successfully")
    conn.close()
except Exception as e:
    print("Unable to connect to the database:", e)

from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Zmień na własny klucz
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Inicjalizacja bazy danych


def init_db():
    con = sqlite3.connect('test.db')
    cur = con.cursor()
    cur.execute('DROP TABLE IF EXISTS users')
    cur.execute('DROP TABLE IF EXISTS tasks')
    cur.execute(
        'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)')
    cur.execute(
        "INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'A', 'A')")
    cur.execute('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT NOT NULL, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))')
    con.commit()
    con.close()


init_db()

# Endpoint rejestracji użytkownika


@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    con = sqlite3.connect('test.db')
    cur = con.cursor()
    cur.execute('SELECT id FROM users WHERE username = ?', (username,))
    user = cur.fetchone()
    if user:
        con.close()
        return jsonify({"msg": "Użytkownik już istnieje"}), 400
    cur.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        (username, password))
    con.commit()
    con.close()
    return jsonify({"msg": "Użytkownik został zarejestrowany"}), 201

# Endpoint logowania


@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    con = sqlite3.connect('test.db')
    cur = con.cursor()
    cur.execute(
        'SELECT id FROM users WHERE username = ? AND password = ?', (username, password))
    user = cur.fetchone()
    con.close()
    if user:
        access_token = create_access_token(identity=user[0])
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Nieprawidłowe dane logowania"}), 401

# Pobieranie zadań


@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    con = sqlite3.connect('test.db')
    cur = con.cursor()
    cur.execute('SELECT id, task FROM tasks WHERE user_id = ?', (user_id,))
    tasks = cur.fetchall()
    con.close()
    return jsonify({"tasks": [{"id": task[0], "task": task[1]} for task in tasks]})

# Dodawanie zadania


@app.route('/tasks', methods=['POST'])
@jwt_required()
def add_task():
    print("here")
    # user_id = get_jwt_identity()
    # task_content = request.json.get('task')
    # print(task_content)
    # if not task_content:
    #     return jsonify({"msg": "Treść zadania jest wymagana"}), 400
    # con = sqlite3.connect('test.db')
    # cur = con.cursor()
    # cur.execute('INSERT INTO tasks (task, user_id) VALUES (?, ?)',
    #             (task_content, user_id))
    # con.commit()
    # new_task_id = cur.lastrowid
    # con.close()
    # return jsonify({"id": new_task_id, "task": task_content}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

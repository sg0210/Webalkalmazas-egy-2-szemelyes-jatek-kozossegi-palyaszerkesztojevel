const Database = require('better-sqlite3')
const db = new Database('bomberman.db')

db.exec (`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL
    )`)

    module.exports = db
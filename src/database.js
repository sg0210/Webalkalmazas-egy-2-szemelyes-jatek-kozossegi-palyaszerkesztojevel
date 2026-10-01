const cors = require('cors')
const express = require('express')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const db = new Database(path.join(__dirname, 'bomberman.db'))
const app = express()

app.use(express.json({
    limit:'10mb'
}))
app.use(express.static('public'))
app.use(cors())


    db.exec (`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            browser_id TEXT UNIQUE NOT NULL
    )`)

    db.exec(`
        CREATE TABLE IF NOT EXISTS maps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            map_json BLOB NOT NULL,
            title TEXT NOT NULL,
            modified_date DATE NOT NULL,
            picture BLOB NOT NULL,
            published NUMBER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`)

app.post('/users', (req, res) => {
    const { browser_id } = req.body

    try {
        db.prepare(`INSERT OR IGNORE INTO users (browser_id) VALUES (?)`).run(browser_id)

        res.json({success: true})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

app.post('/maps/save', (req, res) => {
    const { browser_id, map_json, published, modified_date, title, picture } = req.body

    try {
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        const base64Data = req.body.picture.replace(/^data:image\/png;base64,/,'')

        const filename =`${Date.now()+'_'+user.id}.png`

        fs.writeFileSync(
            `src/pictures/filename`,
            base64Data,
            'base64'
        )

        db.prepare(`INSERT INTO maps (user_id, map_json, published, modified_date, title, picture) VALUES (?, ?, ?, ?, ?, ?)`).run(user.id, map_json, published, modified_date, title, filename)

        res.json({success: true})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
    
})

app.put('/maps', (req, res) => {
    const { id, browser_id, map_json, published, modified_date, title, picture } = req.body

    try {
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        const base64Data = req.body.picture.replace(/^data:image\/png;base64,/,'')

        const filename =`${Date.now()+'_'+user.id}.png`

        fs.writeFileSync(
            `src/pictures/filename`,
            base64Data,
            'base64'
        )

        db.prepare(`UPDATE maps SET map_json = ?, published = ?, modified_date = ?, title = ?, picture = ? WHERE id = ? AND user_id = ?`).run( map_json, published, modified_date, title, picture, id, user.id)

        res.json({success: true})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
    
})

app.delete("/maps/:id", async (req, res) => {
    console.log('Delete request received for map ID:', req.params.id, req.url, req.method, req.body)
    console.log('Request headers:', req.headers)
    const id = req.params.id

    try {
        const result = db.prepare(`DELETE FROM maps WHERE id = ?`).run(id)
        if (result.changes === 0) {
            return res.status(404).json({error: 'Map not found'})
        }
        res.status(204).send()
    } catch (err) {
        console.error('Error deleting map:', err)
        res.status(500).json({error: err.message})
    }
})

app.post('/maps/get', (req, res) => {
    const { browser_id } = req.body

    try {
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        const maps = db.prepare(`Select * FROM maps WHERE user_id = ?`).all(user.id)

        res.json({success: true, maps})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
    
})

app.post('/map/get', (req, res) => {
    const { map_id } = req.body

    try {
        const maps = db.prepare(`Select * FROM maps WHERE id = ?`).all(map_id)

        res.json({success: true, maps})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
    
})


app.listen(3000, () => {
    console.log('Server is running')
})

    module.exports = db 
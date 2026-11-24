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

    db.exec(`
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            map_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            UNIQUE (map_id, user_id),
            FOREIGN KEY (map_id) REFERENCES maps(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`)

    db.exec(`
        CREATE TABLE IF NOT EXISTS wins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            map_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            winner TEXT NOT NULL,
            date DATE NOT NULL,
            FOREIGN KEY (map_id) REFERENCES maps(id),
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

app.post('/maps/insert', (req, res) => {
    const { browser_id, map_json, published, modified_date, title, picture } = req.body

    try {
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        const base64Data = req.body.picture.replace(/^data:image\/png;base64,/,'')

        const filename =`${Date.now()+'_'+user.id+'_'+req.body.id}.png`

        fs.writeFileSync(
            `src/pictures/${filename}`,
            base64Data,
            'base64'
        )

        db.prepare(`INSERT INTO maps (user_id, map_json, published, modified_date, title, picture) VALUES (?, ?, ?, ?, ?, ?)`).run(user.id, map_json, published, modified_date, title, filename)

        res.json({success: true})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
    
})

app.put('/maps/update', (req, res) => {
    const { id, browser_id, map_json, published, modified_date, title, picture } = req.body

    try {
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        const base64Data = picture.replace(/^data:image\/png;base64,/,'')

        const filename =`${Date.now()+'_'+user.id+'_'+id}.png`

        fs.writeFileSync(
            `src/pictures/${filename}`,
            base64Data,
            'base64'
        )

        db.prepare(`UPDATE maps SET map_json = ?, published = ?, modified_date = ?, title = ?, picture = ? WHERE id = ? AND user_id = ?`).run( map_json, published, modified_date, title, filename, id, user.id)
        res.json({success: true})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
    
})

app.delete("/maps/:id", async (req, res) => {
    const id = req.params.id

    try {
        db.prepare(`DELETE FROM ratings WHERE map_id = ?`).run(id)
        db.prepare(`DELETE FROM wins WHERE map_id = ?`).run(id)
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

app.get('/maps/published', (req, res) => {

    try {
        const maps = db.prepare(`Select * FROM maps WHERE published = ?`).all(1)
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


app.post('/maps/:id/rating', (req, res) => {
    const { browser_id } = req.body
    const mapId = Number(req.params.id)

    try {
        const stats = db.prepare(`SELECT AVG(rating) AS average, COUNT(*) AS count FROM ratings WHERE map_id = ?`).get(mapId)
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)
        const own = user ? db.prepare(`SELECT rating FROM ratings WHERE map_id = ? AND user_id = ?`).get(mapId, user.id) : null

        res.json({success: true, average: stats.average || 0, count: stats.count, myRating: own ? own.rating : null})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})


app.post('/maps/:id/rate', (req, res) => {
    const { browser_id, rating } = req.body
    const mapId = Number(req.params.id)
    const value = Number(rating)

    if (!Number.isInteger(value) || value < 1 || value > 5) {
        return res.status(400).json({error: 'Rating must be between 1 and 5'})
    }

    try {
        db.prepare(`INSERT OR IGNORE INTO users (browser_id) VALUES (?)`).run(browser_id)
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)

        const result = db.prepare(`INSERT OR IGNORE INTO ratings (map_id, user_id, rating) VALUES (?, ?, ?)`).run(mapId, user.id, value)
        if (result.changes === 0) {
            return res.status(409).json({error: 'Already rated'})
        }

        const stats = db.prepare(`SELECT AVG(rating) AS average, COUNT(*) AS count FROM ratings WHERE map_id = ?`).get(mapId)
        res.json({success: true, average: stats.average, count: stats.count, myRating: value})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

app.post('/maps/:id/win', (req, res) => {
    const { browser_id, winner } = req.body
    const mapId = Number(req.params.id)

    if (!winner) {
        return res.status(400).json({error: 'Winner is required'})
    }

    try {
        db.prepare(`INSERT OR IGNORE INTO users (browser_id) VALUES (?)`).run(browser_id)
        const user = db.prepare(`SELECT id FROM users WHERE browser_id = ?`).get(browser_id)

        db.prepare(`INSERT INTO wins (map_id, user_id, winner, date) VALUES (?, ?, ?, ?)`).run(mapId, user.id, String(winner), new Date().toISOString())
        res.json({success: true})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

app.get('/maps/:id/leaderboard', (req, res) => {
    const mapId = Number(req.params.id)

    try {
        const rows = db.prepare(`SELECT winner, COUNT(*) AS wins FROM wins WHERE map_id = ? GROUP BY winner ORDER BY wins DESC LIMIT 5`).all(mapId)
        res.json({success: true, leaderboard: rows})
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})


app.listen(3000, () => {
    console.log('Server is running')
})

    module.exports = db 
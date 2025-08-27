const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'recipesdb',
    password: 'Nithin@2803',
    port: 5432
});

client.connect();

// Endpoint 1: Get all recipes (paginated & sorted)
app.get('/api/recipes', async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const total = await client.query(`SELECT COUNT(*) FROM recipes`);
    const result = await client.query(
        `SELECT * FROM recipes ORDER BY rating DESC LIMIT $1 OFFSET $2`, [limit, offset]
    );

    res.json({
        page,
        limit,
        total: parseInt(total.rows[0].count),
        data: result.rows
    });
});

// Endpoint 2: Search recipes
app.get('/api/recipes/search', async(req, res) => {
    const { title, cuisine, rating, total_time, calories } = req.query;
    let query = `SELECT * FROM recipes WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (title) {
        query += ` AND title ILIKE $${idx++}`;
        params.push(`%${title}%`);
    }
    if (cuisine) {
        query += ` AND cuisine ILIKE $${idx++}`;
        params.push(`%${cuisine}%`);
    }
    if (rating) {
        query += ` AND rating >= $${idx++}`;
        params.push(parseFloat(rating));
    }
    if (total_time) {
        query += ` AND total_time <= $${idx++}`;
        params.push(parseInt(total_time));
    }
    if (calories) {
        query += ` AND (nutrients->>'calories')::int <= $${idx++}`;
        params.push(parseInt(calories));
    }

    const result = await client.query(query, params);
    res.json({ data: result.rows });
});

app.listen(3000, () => console.log('Server running on port 3000'));
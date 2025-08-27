const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'recipesdb',
    password: 'Nithin@2803',
    port: 5432
});

// Get all recipes (paginated, sorted by rating descending)
app.get('/api/recipes', async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM recipes');
        const total = parseInt(totalResult.rows[0].count);

        const result = await pool.query(
            'SELECT * FROM recipes ORDER BY rating DESC NULLS LAST LIMIT $1 OFFSET $2', [limit, offset]
        );

        res.json({ page, limit, total, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Search recipes
app.get('/api/recipes/search', async(req, res) => {
    const { title, cuisine, rating } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = [];
    const values = [];

    if (title) {
        values.push(`%${title}%`);
        filters.push(`title ILIKE $${values.length}`);
    }

    if (cuisine) {
        values.push(`%${cuisine}%`);
        filters.push(`cuisine ILIKE $${values.length}`);
    }

    if (rating) {
        values.push(parseFloat(rating));
        filters.push(`rating >= $${values.length}`);
    }

    let whereClause = '';
    if (filters.length > 0) whereClause = `WHERE ${filters.join(' AND ')}`;

    try {
        const totalResult = await pool.query(`SELECT COUNT(*) FROM recipes ${whereClause}`, values);
        const total = parseInt(totalResult.rows[0].count);

        const result = await pool.query(
            `SELECT * FROM recipes ${whereClause} ORDER BY rating DESC NULLS LAST LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, offset]
        );

        res.json({ page, limit, total, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
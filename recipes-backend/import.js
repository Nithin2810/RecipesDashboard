const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'recipesdb',
    password: 'Nithin@2803', // replace with your password
    port: 5432
});

async function importRecipes() {
    await client.connect();

    let data = fs.readFileSync('US_recipes.json', 'utf8');
    data = data.replace(/\bNaN\b/g, "null"); // replace NaN with null
    const jsonData = JSON.parse(data);
    const recipes = Object.values(jsonData);

    for (let r of recipes) {
        const rating = isNaN(r.rating) ? null : r.rating;
        const prep_time = isNaN(r.prep_time) ? null : r.prep_time;
        const cook_time = isNaN(r.cook_time) ? null : r.cook_time;
        const total_time = isNaN(r.total_time) ? null : r.total_time;

        await client.query(
            `INSERT INTO recipes 
            (cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [r.cuisine, r.title, rating, prep_time, cook_time, total_time, r.description, JSON.stringify(r.nutrients), r.serves]
        );
    }

    console.log("✅ All recipes imported successfully!");
    await client.end();
}

importRecipes().catch(err => console.error(err));
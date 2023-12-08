const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// SQLite database setup
const db = new sqlite3.Database(':memory:');

// Create a table for simplicity (This is not how you should create tables in production)
db.serialize(() => {
  db.run('CREATE TABLE clothes (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)');
  db.run('INSERT INTO clothes (name, price) VALUES ("Jumper", 20)');
  db.run('INSERT INTO clothes (name, price) VALUES ("Bottoms", 50)');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  // Intentional SQL Injection Vulnerability
  const searchTerm = req.query.search || '';
  const sql = `SELECT * FROM clothes WHERE name LIKE '%${searchTerm}%'`;
  
  db.all(sql, (err, rows) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.json(rows);
  });
});

app.get('/product/:id', (req, res) => {
  const productId = req.params.id;

  // Intentional XSS Vulnerability 
  res.send(`<h2>Product Details</h2><p>${productId}</p>`);
});

app.post('/purchase', (req, res) => {
  const { userId, creditCardNumber } = req.body;

  // Intentional Sensitive Data Exposure Vulnerability
  console.log(`Purchase made by user ${userId}. Credit Card: ${creditCardNumber}`);

  res.send('Purchase Successful!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

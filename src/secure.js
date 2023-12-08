const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const session = require('express-session');
const csurf = require('csurf');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const port = 3000;

// setup of the SQLite database
const db = new sqlite3.Database(':memory:');

// table for simplicity 
db.serialize(() => {
  db.run('CREATE TABLE clothes (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)');
  db.run('INSERT INTO clothes (name, price) VALUES ("Jumpers", 20)');
  db.run('INSERT INTO clothes (name, price) VALUES ("Bottoms", 50)');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'b802d432626bd0eb3242cdf5084473a6155aa5a6e14f80a96b42f2ee4147ca8b', resave: false, saveUninitialized: true }));
app.use(csurf());
app.use(helmet());
app.use(morgan('combined'));

// Routes
app.get('/', (req, res) => {
  const searchTerm = req.query.search || '';
  const sql = 'SELECT * FROM clothes WHERE name LIKE ?';
  const params = [`%${searchTerm}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.json(rows);
  });
});
app.get('/product/:id', (req, res) => {
  const productId = req.params.id;

  // Safe way to include dynamic data in HTML (Preventing XSS)
  res.send(`<h2>Product Details</h2><p>${escapeHtml(productId)}</p>`);
});
app.post('/purchase', (req, res) => {
  const { userId, creditCardNumber } = req.body;
  // Proper way to handle sensitive data (not logging in this case)
  res.send('Purchase Successful!');
});
// Helper function to escape HTML characters
function escapeHtml(unsafe) {
  return unsafe.replace(/[&<"'>]/g, (match) => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

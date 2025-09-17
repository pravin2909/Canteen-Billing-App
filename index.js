const express = require('express');
const app = express();

app.use(express.json()); // Allows JSON input/output

// Sample menu items (later this will come from database)
const menuItems = [
  { id: 1, name: 'Dosa', quantity: 10, price: 50 },
  { id: 2, name: 'Biryani', quantity: 5, price: 120 },
  { id: 3, name: 'Chapathi', quantity: 20, price: 30 }
];

// Route: Home page
app.get('/', (req, res) => {
  res.send('Welcome to the Hotel Menu API');
});

// Route: Get menu
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// Server listening
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});


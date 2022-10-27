const app = require('express')();
const path = require('path');

const search = require('./search.js'); 
const detail = require('./detail.js');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.get('/api/search', (req, res) => {
  const query = req.query.query;
  search(query, res);
})

app.get('/api/detail', (req, res) => {
  const cat = req.query.cat;
  const id = req.query.id;
  detail(cat, id, res);
})

app.listen(7846)

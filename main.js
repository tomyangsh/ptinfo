const express = require('express')
const app = express();
const path = require('path');

const search = require('./search.js'); 
const get_detail = require('./detail.js').get_detail;
const forminfo = require('./forminfo.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  get_detail(cat, id, res);
})

app.post('/api/forminfo', (req, res) => {
  forminfo.post(req.body.data, res);
})

app.get('/api/forminfo', (req, res) => {
  forminfo.get(req.query.id, res);
})

app.listen(7846)

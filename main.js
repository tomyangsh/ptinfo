const app = require('express')();

const search = require('./search.js'); 
const detail = require('./detail.js');

app.get('/search', (req, res) => {
	const query = req.query.query;
	search(query, res);
})

app.get('/ptinfo', (req, res) => {
	const cat = req.query.cat;
	const id = req.query.id;
	detail(cat, id, res);
})

app.listen(7846)

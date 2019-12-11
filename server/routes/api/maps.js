const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// Get maps
router.get('/', async (req, res) => {
	const maps = await loadMapsCollection();
	res.send(await maps.find({}).toArray());
});

// Get a marker
router.get('/:id', async (req, res) => {
	const maps = await loadMapsCollection();
	console.log(req.params.id);
	res.send(await maps.findOne({'_id': new mongodb.ObjectID(req.params.id)}));
});

// Update (usually just for rating)
router.put('/:id', async (req, res) => {
	const maps = await loadMapsCollection();
	console.log(req.params);
	console.log(req.body.rating);
	res.send(await maps.updateOne({'_id': new mongodb.ObjectID(req.params.id)}, {$push: {"properties.rating": req.body.rating}}))
})

async function loadMapsCollection() {
	const client = await mongodb.MongoClient.connect
	('mongodb://localhost:27017', {
		useUnifiedTopology: true,
		useNewUrlParser: true
	});

	return client.db('uhm-restrooms').collection('markers');
}

module.exports = router;
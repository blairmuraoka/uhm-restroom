# UHM Restrooms and Ratings

**Requirements:**

MongoDB
Google Maps JS API (key may be required, if not, you can sign up for one and Google gives you $300.00 credit for use)

**Installation:**

Full utilization of this project requires you to have a secure domain (HTTPS). You must also have a mongo database setup with a collection.

In the project root, run `npm install` to install dependencies for backend.
In the client folder, run `npm install` to install dependencies for the frontend.

In order for project to work, you will either need to provide the path to your SSL certificate and private key, or provide some other form of secureness. Google Maps JS API has some functions that will not run over insecure origins (getCurrentLocation and watchPosition)

Environmental values are used throughout this project. You will either need to create two .env for the project root and client folder, or remove the dependencies for dotenv and edit the code a little bit.

If you are using environmental values, create the two files below and change the YOUR fields according to your set up.

.env
```
DB_FULLCHAIN=YOUR_SSL_FULLCHAIN_PATH
DB_PRIVATEKEY=YOUR_SSL_PRIVATEKEY_PATH
```
client/.env
```
VUE_APP_HOSTNAME=YOUR_HOSTNAME
VUE_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_APPS_API_KEY
VUE_APP_API=YOUR_API_LINK
```

In server/routes/api/maps.js
```
async function loadMapsCollection() {
	const client = await mongodb.MongoClient.connect
	('mongodb://localhost:27017', {
		useUnifiedTopology: true,
		useNewUrlParser: true
	});

	return client.db('uhm-restrooms').collection('markers');
}
```
Change the first argument of `mongodb.MongoClient.connect` to the path of your Mongo database.
Change the `return` line to your appropriate database and collection.

require('dotenv').config()
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const enforce_ssl = require('express-enforces-ssl');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(enforce_ssl());

const options = {
    cert: fs.readFileSync(process.env.DB_FULLCHAIN),
    key: fs.readFileSync(process.env.DB_PRIVATEKEY)  
}

const maps = require('./routes/api/maps');

app.use('/api/maps', maps);

const server = https.createServer(options, app);
server.listen(5000)
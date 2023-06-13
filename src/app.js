const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/routes');

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));



app.use(router);


module.exports = app;

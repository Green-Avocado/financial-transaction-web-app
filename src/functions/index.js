const functions = require('firebase-functions');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const api = express();
api.use(cors({ origin: true }));

var con = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "pass",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

api.get('/api', (req, res) => {
  return res.status(200).json({ hello: 'World' })
});

exports.api = functions.https.onRequest(api);


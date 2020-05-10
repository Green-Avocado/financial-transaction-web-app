const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const api = express();
api.use(cors({ origin: true }));

api.get('/api', (req, res) => {
  return res.status(200).json({ hello: 'World' })
});

exports.api = functions.https.onRequest(api);


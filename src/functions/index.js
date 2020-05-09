const functions = require('firebase-functions');

exports.app = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});


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
    console.log("Connected to MySQL Database!");
});

function readDataFromMySQL(cb) {
    con.query("SELECT * FROM data;", function (err, data, fields) {
        if (err) throw err;
        cb(data);
    });
}

function readTypesFromMySQL(cb) {
    con.query("SELECT * FROM types;", function (err, types, fields) {
        if (err) throw err;
        cb(types);
    });
}

function writeToMySQL(jsonData) {
    var data = jsonData[0];
    var types = jsonData[1];

    con.query("TRUNCATE TABLE data;");

    for(var i = 1; i < data.length; i++) {
        con.query("INSERT INTO data (id, date, account, type, security, amount, dAmount, costBasis) VALUES ('" + data[i].join("','") + "');");
    }

    con.query("TRUNCATE TABLE types;");

    for(var i = 0; i < types.length; i++) {
        con.query("INSERT INTO types (typename) VALUES ('" + types[i] + "');");
    }
}

api.post('/api', (req, res) => {
    console.log(req.body);
    writeToMySQL(req.body);
    return res.status(200).send(req.body);
});

api.get('/api', (req, res) => {
    readDataFromMySQL(function(data) {
        console.log(data);
        readTypesFromMySQL(function(types) {
            console.log(types);
            return res.status(200).send([ data, types ]);
        });
    });
});
const port = 5000

api.use("/", express.static('public'))
api.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


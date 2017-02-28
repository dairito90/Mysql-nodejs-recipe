var express = require('express');

var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'flashcards'
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/users/register', function(req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.sendStatus(400);
    }
    var salt = bcrypt.genSaltSync(3);
    var hashedPassword = bcrypt.hashSync(req.body.password, salt);
    console.log('hello', req.body.username, hashedPassword);
    var query = `INSERT INTO users(username,hashed_password)
    VALUES('${req.body.username}','${hashedPassword}')`;
    connection.query(query, function(err, result) {
        if (err) {
            console.log(err.toString());
            return res.status(500).send(err);
        }
        res.json(result);
        console.log(" DB request succeded");
    });
});

app.post('/users/login', function(req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        console.log('bad request');
        return res.sendStatus(400);
    }
    var query = `SELECT * FROM users WHERE username '${req.body.username}'`;
    connection.query(query, function(err, rows) {
        if (err) {
            console.log('Error loking up user');
            return res.sendStatus(500);
        }
        if (rows.length != 1) {
            console.log('Multiple or no user found');
            return res.sendStatus(500);
        }

        var userInDB = rows[0];
        var isPasswordCorrect = bcrypt.compareSync(req.body.password, userInDB.hashed_password);
        if (isPasswordCorrect) {
            console.log('Failed at logging in whit bad password');
            res.sendStatus(401);
            return;
        }
        res.sendStatus(200);

    });


});

require('./flashcard.js')(app,connection);



app.listen(8889);

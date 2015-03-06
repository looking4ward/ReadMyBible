var express = require('express');
books = require('./routes/readmybible');
var cors = require('cors');
var app = express();
app.use(cors());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', books.home);
app.get('/books/:id', books.findById);
app.get('/books/mp3/', books.findMp3ById);
app.get('/books/mp3/id', books.findMp3ById);



var port = process.env.PORT || 3000;
app.listen(port);
console.log('ReadMyBible server running...');
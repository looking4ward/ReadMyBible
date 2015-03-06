var express = require('express');
books = require('./routes/readmybible');
var cors = require('cors');
var app = express();
app.use(cors());

app.get('/', books.home);
app.get('/books/:id', books.findById);
app.get('/books/mp3/', books.findMp3ById);
app.get('/books/mp3/id', books.findMp3ById);



var port = process.env.PORT || 3000;
app.listen(port);
console.log('ReadMyBible server running...');
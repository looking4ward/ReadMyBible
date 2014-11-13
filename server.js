var express = require('express');
books = require('./routes/readmybible');
var app = express();


app.get('/', books.home);
app.get('/books/:id', books.findById);
app.get('/books/mp3/', books.findMp3ById);
app.get('/books/mp3/id', books.findMp3ById);




app.listen(3000);
console.log('ReadMyBible server running...');
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://127.0.0.1:27017/';

app.listen(8000, function() {
  console.log('App listening on port 8000');
});

// La racine de notre site est dans le sous répertoire wwwroot de notre projet
app.use('/', express.static(__dirname+"/wwwroot"));

// gérer la route /movies
app.get('/movies', function(request, response) {
    // http://127.0.0.1:8000/movies?start=1&end=10
    MongoClient.connect(url, { useNewUrlParser: true }, 
        function(err, dbMongo) {
            const dbMovies = dbMongo.db("Movies");
            dbMovies.collection("IMDB").find({}).toArray(
                function(err, result) {
                    let startIndex = 1;
                    if (request.query.start) {
                        startIndex = parseInt(request.query.start);
                    }
                    let prevIndex = startIndex - 10;
                    if (prevIndex <=0 ) prevIndex = 1;
                    let nextIndex = startIndex + 10;
                    if (nextIndex >= result.length - 10) nextIndex = result.length - 9;
                    let dataToEJS = {
                        movies : result.slice(startIndex-1, startIndex+9),
                        prevIndex : prevIndex,  
                        nextIndex : nextIndex,
                        maxIndex : result.length - 9
                    };
                    response.setHeader('Content-Type', 'text/html');
                    response.render('movieList.ejs', dataToEJS);
                });
        });
   });
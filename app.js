const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';

app.listen(8080, function() {
  console.log('App listening on port 8080');
});

app.use('/', express.static(__dirname+"/wwwroot"));
app.use(express.urlencoded({extended:false}));

app.get('/movies', function(request, response) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, 
      function(err, dbMongo) {
        const dbMovies = dbMongo.db("Movies");
        dbMovies.collection("IMDB").find({}).toArray(function(err, result) {
          if (err) throw err;
          response.setHeader('Content-Type', 'text/html');
          let ranges = [];
          ranges[0]= 0;
          ranges[1] = 10;
          ranges[2]= 0;
          ranges[3] = 10;
          ranges[4]= 10;
          ranges[5] = 20;
          ranges[6]= result.length-10;
          ranges[7] = result.length;
          if(request.query.start&&request.query.end){
            if(parseInt(request.query.start)!=0){
              ranges[2] = parseInt(request.query.start)-10;
              ranges[3] = request.query.start;
            }
            if(parseInt(request.query.end)!=result.length){
              ranges[4] = request.query.end;
              ranges[5] = parseInt(request.query.end)+10;
            }
            else{
              ranges[4] = result.length-10;
              ranges[5] = result.length;
            }
          }
          response.render('movieList.ejs', {
            movies : result.slice(ranges[4]-10,ranges[4]),
            ranges : ranges
            });
          dbMongo.close();
        });
      });
});

app.post('/movies', function(request, response) {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, 
    function(err, dbMongo) {
      const dbMovies = dbMongo.db("Movies");
      let newMovie = { Series_Title: request.body.title, Released_Year: request.body.year };
      dbMovies.collection("IMDB").insertOne(newMovie, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      });
    });
  response.redirect('/movies');
});
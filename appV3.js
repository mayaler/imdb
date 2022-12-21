const { response } = require("express");
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const mongo = require("mongodb");

const url = "mongodb://127.0.0.1:27017/";

app.listen(8000, function () {
  console.log("App listening on port 8000");
});

// La racine de notre site est dans le sous répertoire wwwroot de notre projet
app.use("/", express.static(__dirname + "/wwwroot"));
app.use(express.urlencoded({ extended: false }));

// gérer la route /movies
app.get("/movies", function (request, response) {
  // http://127.0.0.1:8000/movies?start=1&end=10
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbMongo) {
    const dbMovies = dbMongo.db("Movies");
    dbMovies
      .collection("IMDB")
      .find({})
      .toArray(function (err, result) {
        let startIndex = 1;
        if (request.query.start) {
          startIndex = parseInt(request.query.start);
        }
        let prevIndex = startIndex - 10;
        if (prevIndex <= 0) prevIndex = 1;
        let nextIndex = startIndex + 10;
        if (nextIndex >= result.length - 10) nextIndex = result.length - 9;
        let dataToEJS = {
          movies: result.slice(startIndex - 1, startIndex + 9),
          prevIndex: prevIndex,
          nextIndex: nextIndex,
          maxIndex: result.length - 9,
        };
        response.setHeader("Content-Type", "text/html");
        response.render("movieList.ejs", dataToEJS);
      });
  });
});

app.get("/movies/:id", function (request, response) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbMongo) {
    const dbMovies = dbMongo.db("Movies");
    const query = { _id: mongo.ObjectId(request.params.id.substring(1)) };
    dbMovies
      .collection("IMDB")
      .find(query)
      .toArray(function (err, result) {
        response.setHeader("Content-Type", "text/json");
        response.send(result);
        //console.log(result);
      });
  });
});

app.get("/edit/:id", function (request, response) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbMongo) {
    const dbMovies = dbMongo.db("Movies");
    const query = { _id: mongo.ObjectId(request.params.id.substring(1)) };
    dbMovies
      .collection("IMDB")
      .find(query)
      .toArray(function (err, result) {
        response.setHeader("Content-Type", "text/html");
        response.render("movieEdit.ejs", result[0]);
        //console.log(result);
      });
  });
});

app.post("/movies", function (request, response) {
  console.log(request.body.movieName);
  const actorsArray = request.body.actors.split(",");

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbMongo) {
    console.log(request.body.year);
    const dbMovies = dbMongo.db("Movies");
    let newMovie = {
      Series_Title: request.body.movieName,
      Released_Year: request.body.year,
      Director: request.body.director,
      Poster_Link: request.body.img_url,
      Overview: request.body.description,
      Star1: actorsArray[0],
      Star2: actorsArray[1],
      Star3: actorsArray[2],
    };
    dbMovies.collection("IMDB").insertOne(newMovie, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
    });
  });

  response.redirect("/movies");
});

app.delete("/movies/:id", function (request, response) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbMongo) {
    const dbMovies = dbMongo.db("Movies");
    const query = { _id: mongo.ObjectId(request.params.id.replace(":", "")) };
    dbMovies.collection("IMDB").deleteOne(query, function (err, result) {
      if (err) throw err;
      response.send("deleted");
    });
  });
});

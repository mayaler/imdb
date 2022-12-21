const express = require('express');
const app = express();

app.listen(8000, function() {
  console.log('App listening on port 8000');
});

// La racine de notre site est dans le sous répertoire wwwroot de notre projet
app.use('/', express.static(__dirname+"/wwwroot"));

// gérer la route /movies
app.get('/movies', function(request, response) {
    response.setHeader('Content-Type', 'text/html');
    response.send("<strong>Voici le liste des films ...</strong>");
   });
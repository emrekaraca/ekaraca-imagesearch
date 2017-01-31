var express = require('express');
var app = express();
var path = require('path');
var request = require('request');

var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
  //res.sendFile(path.join(__dirname + '/index.html'));
});

var resBody;

app.get('/:value', function(req, res) {
  var searchString = req.params.value;
  var googleApi = 'https://www.googleapis.com/customsearch/v1?q=' + searchString + '&cx=007559416799391727436%3Arpjxxfoicoc&searchType=image&key=AIzaSyBc8zggdDLbwDZKpm6v0vi2N8NR_QwbuYY'
  request.get(googleApi, function(err,res,body){
    if(err) throw err;
    if(res.statusCode !== 200 ) {
      console.log("the request could not be handled!");
      console.log(body);
    }
    console.log("the request was handled succesfully!");
    console.log(body);
  });
});

app.listen(port);

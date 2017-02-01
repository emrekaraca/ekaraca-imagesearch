var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var fs = require('fs');

var port = process.env.PORT || 3000;

app.get('/', function(req, resp) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/imagesearch/:value', function(req, res) {
  var string = req.params.value;
  console.log('string: ' + string);
  var page = 1;
  page = req.query.page;
  console.log(page);
  var searchString = string;
  var start = (page*10)-9;
  console.log(start);
  var googleApi = 'https://www.googleapis.com/customsearch/v1?q=' + searchString + '&start=' + start + '&cx=007559416799391727436%3Arpjxxfoicoc&searchType=image&key=AIzaSyBc8zggdDLbwDZKpm6v0vi2N8NR_QwbuYY'
  var wstream = fs.createWriteStream('myOutput.txt');
  var parsed;
  request.get(googleApi, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body) // Show the HTML for the Google homepage.
      parsed = JSON.parse(body);
      var returnObj = [];
      for (var i=0; i<parsed.items.length; i++) {
        returnObj.push({});
        returnObj[i].link = parsed.items[i].link;
        returnObj[i].title = parsed.items[i].title;
        returnObj[i].context = parsed.items[i].image.contextLink;
        returnObj[i].thumbnail = parsed.items[i].image.thumbnailLink;
      }
      res.json(returnObj);
      //res.end(returnObj);
    }
  })


});

app.listen(port);

/*
ToDo's:
- convert Google Response to JSON, filter info and stream back to res
- filter categories: image url, alt text, image page url
- include pagination option (add ?offset=2)


*/

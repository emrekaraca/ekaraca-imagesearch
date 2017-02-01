var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var fs = require('fs');
var mongoose = require('mongoose');
app.use(require('express-favicon-short-circuit'));
var port = process.env.PORT || 3000;

mongoose.connect('mongodb://dbuser:userpwd@ds139909.mlab.com:39909/ekaraca-imagesearch');

var Schema = mongoose.Schema;

var searchSchema = new Schema ({
  searchID: Number,
  searchString: String
});

var searchHistory = mongoose.model('searchHistory', searchSchema);


app.get('/', function(req, resp) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/imagesearch/:value', function(req, res) {
  var string = req.params.value;

  // STORE STRING IN DB WITH SEARCH ID
  searchHistory.count({}, function(err, c) {
    console.log('count is: ' + c);
    if (c==0) {
      var code = 1
    }
    else {
      var code = c+1
    }
    var addSearch = searchHistory({
      searchID: code,
      searchString: string
    });
    addSearch.save(function(err) {
      if (err) throw err;
      console.log(string + ' was saved \nThe search ID is: ' + code)
    })
  })
  console.log('string: ' + string);
  var page = req.query.page || 1;
  console.log(page);
  var searchString = string;
  var start = (page*10)-9;
  console.log(start);
  var googleApi = 'https://www.googleapis.com/customsearch/v1?q=' + searchString + '&start=' + start + '&cx=007559416799391727436%3Arpjxxfoicoc&searchType=image&key=AIzaSyBc8zggdDLbwDZKpm6v0vi2N8NR_QwbuYY'
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

app.get('/api/imagesearch/latest', function(req, res) {
  // CONNECT TO DB and FETCH LAST 10 QUERIES
})

app.listen(port);

/*
ToDo's:
- convert Google Response to JSON, filter info and stream back to res
- filter categories: image url, alt text, image page url
- include pagination option (add ?offset=2)


*/

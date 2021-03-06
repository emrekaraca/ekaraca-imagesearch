var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var mongoose = require('mongoose');
app.use(require('express-favicon-short-circuit'));
var port = process.env.PORT || 3000;

mongoose.connect('mongodb://dbuser:userpwd@ds139909.mlab.com:39909/ekaraca-imagesearch');
var Schema = mongoose.Schema;
var searchSchema = new Schema ({
  searchID: Number,
  searchString: String,
  searchTime: String
});
var searchHistory = mongoose.model('searchHistory', searchSchema);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// IMAGE SEARCH FUNCTIONALITY
app.get('/api/imagesearch/:value', function(req, res) {
  var string = req.params.value;

  // Store Search query, search id and timestamp in DB
  searchHistory.count({}, function(err, c) {
    console.log('count is: ' + c);
    if (c==0) {
      var code = 1
    }
    else {
      var code = c+1
    }
    var timestamp = new Date();
    var addSearch = searchHistory({
      searchID: code,
      searchString: string,
      searchTime: timestamp
    });
    addSearch.save(function(err) {
      if (err) throw err;
      console.log(string + ' was saved \nThe search ID is: ' + code)
    })
  })

  // Perform Search (and request specific page, if needed) and return results
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

// LATEST SEARCHES FUNCTIONLITY
app.get('/api/latestsearches', function(req, res) {
  var searchList = [];

  // Retrieve and display the last 10 searches
  searchHistory.count({}, function(err, c) {
    console.log(c);
    var counter = 0;
    searchHistory.find({}, function(err, data) {
      for (var i=data.length-1; i>=0 && i>= data.length-10; i--) {
        console.log(data[i]);
        searchList.push({});
        searchList[counter].SearchQuery = data[i].searchString;
        searchList[counter].When = data[i].searchTime;
        counter++;
      }
      res.json(searchList)
    })
  })
})

app.listen(port);

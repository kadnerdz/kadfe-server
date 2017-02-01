var JsonDB = require('node-json-db');
var db = new JsonDB("db", true, false);
var express = require('express');
var app = express();

app.post('/brewed', function (req, res) {
  db.push("/state1","true");
  db.reload();
  res.send('Coffee is made!');
});

app.put('/claimed', function (req, res) {
  if(db.getData("/state1") == "true"){
    db.push("/state1","false");
    db.reload();
  }
  res.send(db.getData("/state1"));
});

app.get('/status', function (req, res) {
  res.send(db.getData("/state1"));
});

app.listen(3000, function () {
  console.log('Welcome to the Kadfe Backend!');
});

app.listen(3000, function () {
  console.log('Welcome to the Kadfe Backend!');
});

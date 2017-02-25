var JsonDB = require('node-json-db');
var db = new JsonDB("db", true, false);
var express = require('express');
var app = express();

app.post('/brewed', function (req, res) {
  const claimant = req.query.user
  db.push("/state1","true");
  db.reload();
  res.send('Coffee is made!');
});

app.post('/coffee/claim', function (req, res) {
  const claimant = req.query.user
  if(db.getData("/state1") == "true"){
    db.push("/state1","false");
    db.reload();
  }
  res.send(db.getData("/state1"));
});

app.delete('/coffee/claim', function(req, res) {
  const claimant = req.query.user
})

app.get('/status', function (req, res) {
  res.send(db.getData("/state1"));
});

app.listen(3000, function () {
  console.log('Welcome to the Kadfe Backend!');
});

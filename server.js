/*
* Server configuration for Certificate Management
*/
var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var endpoints=require(__dirname+'/endpoints/apiendpoint.js')
endpoints.initAPI(app);
app.listen(port);

console.log('Parking Management API started on: ' + port);

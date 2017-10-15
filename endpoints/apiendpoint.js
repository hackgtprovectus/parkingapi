
// var WebSocket = require("ws").client;
// var io = require('socket.io');

//var ws = new WebSocket("wss://ic-websocket-server.run.aws-usw02-pr.ice.predix.io/events", options);
//var socket=io("wss://ic-websocket-server.run.aws-usw02-pr.ice.predix.io/events",options);
var parkingapi     = require('../api/parkingapi.js')

var apipath = '/api';
var initAPI = function(app) {
    app.get(apipath+"/",function(req,res){

      res.json({status:'ok'});


    });

    app.get(apipath+"/parkinglocations",function(req,res){
      parkingapi.getParkingLocations(req,res);
    })
  }


  // Export initAPI() function (called by server.js)
module.exports = {
    initAPI: initAPI
}



var apipath = '/api';
var initAPI = function(app) {
    app.get(apipath+"/",function(req,res){
        res.json({status:'ok'});
    });
  }


  // Export initAPI() function (called by server.js)
module.exports = {
    initAPI: initAPI
}

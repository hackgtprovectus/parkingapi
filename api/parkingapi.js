var request = require('request');
var consts=require('../configs/config.js');
const  URL  = require('url').Url;

var getLocationsIds=function(bbox){
  console.log("In getLocationsIds");
  return new Promise(function(resolve,reject){
    var myURL = consts.metadataUrl+'/locations/search?q=locationType:'+consts.locationType
  +'&bbox='+bbox+'&page=0&size=50';
    var options={
      url:myURL,
      method:'GET',
      headers:{
        'Authorization':' Bearer '+consts.token,
        'Predix-Zone-Id':consts.PredixZoneId
      }
    };
    request(options, function (error, response, body) {
      var jsonRes=JSON.stringify(response);
      if (!error && response.statusCode == 200) {
        var locations=JSON.parse(jsonRes);
        resolve(JSON.parse(locations.body).content);
      }else{
        reject('Internal server error');
      }
    });
  });
}

var calculateParkingPopulationRate=function(result){
    console.log("In calculateParkingPopulationRate");
    var finalDataList=new Array();
    for(var i=0; i< result.length;i++){
      var temp=JSON.stringify(result[i]);
      var tempJSON=JSON.parse(temp);
      if((JSON.stringify(tempJSON.uniqueVehicleLeaving)!='0')&&(JSON.stringify(tempJSON.uniqueVehicleEntering)!='0'))
      var rate=parseInt(JSON.stringify(tempJSON.uniqueVehicleLeaving))/parseInt(JSON.stringify(tempJSON.uniqueVehicleEntering));
      var parkingzone={coordinates:result[i].locations.coordinates,rate:rate};
      finalDataList.push(parkingzone);
    }
    return new Promise(function(resolve,reject){
    if(finalDataList.length>0){
      finalDataList.sort(function(a,b){
        return b.rate-a.rate;
      });
        resolve(finalDataList);
    }else{
        resolve(finalDataList);
    }
  } );

}


var getListOfVehicleLeavingParkingZone=function(startTime,endTime,result){
  console.log("In getListOfVehicleLeavingParkingZone");
     uniqueVehicleEnteringinLocationList=new Array();
     for (var index=0;index<result[0].length;index++){
       var uniqueVehicle = new Set();
       var temp =JSON.stringify(result[0][index]);
       var locations=result[1][index];
       if(typeof temp != 'undefined')
        {
       var tempJSON=JSON.parse(temp);
       for(var item=0;item<tempJSON.length;item++){
              var objectUid=tempJSON[item].properties.objectUid;
              uniqueVehicle.add(JSON.stringify(objectUid));
            }
      var locationsVehicleIn={locations:locations,uniqueVehicleEntering:uniqueVehicle.size};
      uniqueVehicleEnteringinLocationList.push(locationsVehicleIn)
     }
     else{
       var locationsVehicleIn={locations:locations,uniqueVehicleEntering:"0"};
       uniqueVehicleEnteringinLocationList.push(locationsVehicleIn);
        }
     }
     var options=new Array();
     var locations=new Array();
     for(var index=0;index<result[1].length;index++){
       var location=result[1][index];
       var myURL = consts.eventsUrl+'/locations/'+result[1][index].locationUid+'/events?eventType='+consts.PKOUT
       +'&startTime='+startTime+'&endTime='+endTime;
       var option={
           url:myURL,
           method:'GET',
           headers:{
             'Authorization':' Bearer '+consts.token,
             'Predix-Zone-Id':consts.PredixZoneId
           }
         };
         options.push(option);
         locations.push(location);
     }
     var vehicleLeavingParkingZoneList=new Array();
     return new Promise(function(resolve,reject){
       Promise.all(options.map(function(item) {
           return new Promise(function(resolve,reject) {
             request(item, function (error, response, body) {
               var jsonRes=JSON.stringify(response);

               if (!error && response.statusCode == 200) {
                 var vehicleIn=JSON.parse(jsonRes);
                 resolve(JSON.parse(vehicleIn.body).content);
          }else{
            reject('Internal server error');
          }
         });
       });
       })).then(function(result){

        result.forEach(function(obj){
        vehicleLeavingParkingZoneList.push(obj);
       })
       resolve([vehicleLeavingParkingZoneList,uniqueVehicleEnteringinLocationList]);

       }).catch(function(err){
         reject('Internal server error');
       });
     });
};


var getListOfVehicleEnteringParkingZone=function(startTime,endTime,result){
 console.log("In getListOfVehicleEnteringParkingZone");
  var length=result.length;
  var options=new Array();
  var locations=new Array();
  for(var index=0;index<length;index++){
    var locationUid=result[index].locationUid;
    var coordinates=result[index].coordinates;
    var myURL = consts.eventsUrl+'/locations/'+result[index].locationUid+'/events?eventType='+consts.PKIN
    +'&startTime='+startTime+'&endTime='+endTime;
    var option={
        url:myURL,
        method:'GET',
        headers:{
          'Authorization':' Bearer '+consts.token,
          'Predix-Zone-Id':consts.PredixZoneId
        }
      };
      var location={locationUid:locationUid,coordinates:coordinates};
      options.push(option);
      locations.push(location);
  }
var vehicleEntringParkingZoneList=new Array();
return new Promise(function(resolve,reject){
  Promise.all(options.map(function(item) {
      return new Promise(function(resolve,reject) {
        request(item, function (error, response, body) {
          var jsonRes=JSON.stringify(response);
           //console.log(response);
          if (!error && response.statusCode == 200) {
            var vehicleIn=JSON.parse(jsonRes);
            resolve(JSON.parse(vehicleIn.body).content);
     }else{
       reject('Internal server error');
     }
    });
  });
  })).then(function(result){

   result.forEach(function(obj){
   vehicleEntringParkingZoneList.push(obj);
  })
  resolve([vehicleEntringParkingZoneList,locations]);

  }).catch(function(err){
    console.log(err)
    reject('Internal server error');
  });
});

};

var filterUniqueVehicleLeavingParkingZone=function(result){
  console.log("In filterUniqueVehicleLeavingParkingZone");
  uniqueVehicleLeavinginLocationList=new Array();
  for (var index=0;index<result[0].length;index++){
    var uniqueVehicle = new Set();
    var temp =JSON.stringify(result[0][index]);
    var locations=result[1][index];
    if(typeof temp != 'undefined'){
    var tempJSON=JSON.parse(temp);
    for(var item=0;item<tempJSON.length;item++){
           var objectUid=tempJSON[item].properties.objectUid;
           uniqueVehicle.add(JSON.stringify(objectUid));
   }
   locations.uniqueVehicleLeaving=uniqueVehicle.size;
   var locationsVehicleIn=locations;
   uniqueVehicleLeavinginLocationList.push(locationsVehicleIn)
  }
  else{
    locations.uniqueVehicleLeaving="0";
    var locationsVehicleIn=locations;
    uniqueVehicleLeavinginLocationList.push(locationsVehicleIn);
  }
  }

  return new Promise(function(resolve,reject){
    if(uniqueVehicleLeavinginLocationList.length>0){
      resolve(uniqueVehicleLeavinginLocationList);
    }else{
      uniqueVehicleLeavinginLocationList=new Array();
      resolve(uniqueVehicleLeavinginLocationList);
    }
  });
};


var getParkingLocations=function(req,res){
console.log("In getParkingLocations");
 var x1=req.body.a;
 var x2=req.body.b;
 var x3=req.body.c;
 var x4=req.body.d;
 var bbox=x1+':'+x2+','+x3+':'+x4;
 var startTime1='1497908265000'
 var endTime1='1497909105000';
 var startTime2='1497909105000'
 var endTime2='1497909705000';
 bbox='32.715675:-117.161230,32.708498:-117.151681';
 getLocationsIds(bbox).then(getListOfVehicleEnteringParkingZone.bind(null,startTime1,endTime1))
 .then(getListOfVehicleLeavingParkingZone.bind(null,startTime2,endTime2))
 .then(filterUniqueVehicleLeavingParkingZone)
 .then(calculateParkingPopulationRate)
 .then(function(result){
   res.setHeader('Content-Type','application/json');
   resultRes={success:true,content:result};
   res.send(resultRes);
 }).catch(function(error){
   var errorRes={status:false,errorRes:error}
   res.setHeader('Content-Type','application/json');
   res.send(errorRes);
 });
};
module.exports = {
getParkingLocations:getParkingLocations

};

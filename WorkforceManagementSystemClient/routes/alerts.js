var ejs = require("ejs");
var mq_client = require('../rpc/client');

exports.alertcriteria = function(req,res){		
	var msg_payload={"url": "alertcriteria"};
		mq_client.make_request('alert_queue', msg_payload, function(err, result){
			console.log("result at of alertcriteria:" +JSON.stringify(result));
			res.send(result);
				
		});
};

exports.searchAlerts = function(req,res){		
	var clientId = req.param("clientId");
	var buildingId = req.param("buildingId");
	var alertTypeId = req.param("alertTypeId");
	var severity = req.param("severity");
	var alertFromdate = req.param("alertFromdate");
	var alertTodate = req.param("alertTodate");
	var roleId = req.param("roleId");
	
	console.log("buildingId:"+buildingId);
	console.log("clientId:"+clientId);
	console.log("alertTypeId:"+alertTypeId);
	console.log("severity:"+severity);
	console.log("alertFromdate:"+alertFromdate);
	console.log("alertTodate:"+alertTodate);

	var msg_payload={"url": "searchalerts", "clientId": clientId, "buildingId": buildingId, "alertTypeId":alertTypeId, 
			"severity":severity, "alertFromdate":alertFromdate, "alertTodate":alertTodate, "roleId" : roleId};
			
		mq_client.make_request('alert_queue', msg_payload, function(err, result){
			console.log("result at searchAlerts:" +JSON.stringify(result));
					//res.send({"Status" : "Success", "userId": result.userId, "firstName": result.firstName});
			res.send(result);
				
		});
};
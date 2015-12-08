var mysql = require('./mysql');

function handle_request(msg, callback) {
	
	var res= {};
	var query;
	
	if(msg.url === "alertcriteria") {
		query = "select alertTypeId,alertName from alertType"
		mysql.fetchData(function(err,results){
			if(err){
				console.log("err");
				callback(err,null);
			}
			else 
			{
				console.log(JSON.stringify(results));
				if(results.length > 0) {
					console.log("Valid alert criteria");
					callback(null, results);
				}
				else {
					console.log("InValid alert criteria");
					result = {"status":"fail"};
					callback(null, result);
				}
			}  
		},query);
	}
	
	if(msg.url === "searchalerts") {
		
		 var alertFromdate = msg.alertFromdate;
		var alertTodate = msg.alertTodate;
		var roleId = msg.roleId;
		if(msg.clientId === undefined)
			{var clientId = null;}
		else{ var clientId = msg.clientId;}
		
		if(msg.buildingId === undefined)
		{var buildingId = null;}
	else{ var buildingId = msg.buildingId;}
		
		if(msg.alertTypeId === undefined)
		{var alertTypeId = null;}
	else{ var alertTypeId = msg.alertTypeId;}
		
		if(msg.severity === undefined)
		{var severity = null;}
	else{ var severity = msg.severity;}
		
		if(msg.alertFromdate === undefined)
		{var alertFromdate = null;}
	else{ var alertFromdate = msg.alertFromdate;}
		
		if(msg.alertTodate === undefined)
		{var alertTodate = null;}
	else{ var alertTodate = msg.alertTodate;}
		console.log("buildingId:"+buildingId);
		console.log("clientId:"+clientId);
		console.log("alertTypeId:"+alertTypeId);
		console.log("severity:"+severity);
		console.log("alertFromdate:"+alertFromdate);
		console.log("alertTodate:"+alertTodate);
		
		//query = "select CONCAT(ud.firstName,' ', ud.lastName) as name, b.buildingName, a.description, at.alertName, a.severity, DATE_FORMAT(a.alertTime,'%Y-%m-%d') as alertTime, a.guardId, ud.userSSN from userdetails ud, client c, building b, alerts a, alerttype at " +
		//	"where ud.userId=c.clientId and b.buildingId=a.buildingId and a.alertTypeId=at.alertTypeId";
	//query = "select * from alertType at JOIN alerts a on  at.alertTypeId=a.alertTypeId where a.buildingId="+buildingId+" or a.buildingId in(select buildingId from building where clientId="+clientId+")";
	
	query="select distinct DATE_FORMAT(a.alertTime,'%Y-%m-%d') as alertTime, at.alertName, a.description, a.severity, concat(ud2.firstName,' ',ud2.lastName) as guardName, concat(ud1.firstName,' ',ud1.lastName) as clientName, b.buildingName from userdetails ud1, building b, alerttype at, alerts a, userdetails ud2 where a.alertTypeId = at.alertTypeId and a.guardId = ud2.userId and a.buildingId = b.buildingId and b.clientId = ud1.userId";
	var userData = [clientId,buildingId,alertTypeId,severity];
	
	for(var i=0;i<userData.length;i++){
		 if(userData[i]!==null){
		  switch(i){
		  case 0: query+=" and b.clientId="+userData[0];	break;
		  case 1: query+=" and b.buildingId ="+userData[1];	break;
		  case 2: query+=" and at.alertTypeId ="+userData[2];	break;
		  case 3: query+=" and a.severity like '%"+userData[3]+"%'";	break;

		  }
		 }
	  }
	
	if(alertFromdate !== undefined && alertFromdate!==null && alertTodate !== undefined && alertTodate!==null)
		{
		query+=" and a.alertTime between '"+alertFromdate+"' and '"+alertTodate+"'";
		}
	if(roleId===2)
		{
		query +=" and (at.recipients like 'All' or at.recipients like 'Client')";
		}
	else if(roleId===3)
		{
		query +=" and (at.recipients like 'All' or at.recipients like 'Guard')";
		}
		
		console.log(query);
		mysql.fetchData(function(err,results){
			if(err){
				console.log("err");
				callback(err,null);
			}
			else 
			{
				console.log(JSON.stringify(results));
				if(results.length > 0) {
					console.log("Valid alert criteria");
					callback(null, results);
				}
				else {
					console.log("InValid alert criteria");
					result = {"status":"fail"};
					callback(null, result);
				}
			}  
		},query);
	}
}

exports.handle_request = handle_request;
var ejs = require("ejs");
var mq_client = require('../rpc/client');

exports.index = function(req, res){
  res.render('index');
};

exports.dashboard = function(req, res){
	
	getClientAndGuardDetails(req,res);
//    res.render('dashboard', { roleId: req.session.roleId });
};

exports.profile = function(req, res){	//divya
	console.log("req.session.userId:"+req.session.userId+" req.session.roleId:"+req.session.roleId);
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}	
	else if(req.session.roleId == 3){		
		res.render('displayGuard', { guardId: req.session.userId, roleId: req.session.roleId });
	}
	else  if(req.session.roleId == 2){
		console.log("dfdfdf"+req.session.userId);
		res.render('searchClients', { clientId: req.session.userId, roleId: req.session.roleId });
	}
}

exports.displayGuard = function(req, res){	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId == 3 && req.param("guardId") != req.session.userId){	
	  res.render('errorPage',{errorMsg : "You are not allowed to see other guards details!", roleId: req.session.roleId });
	  }
	else if(req.session.roleId == 2) {
		res.render('errorPage',{errorMsg : "You are not allowed to see guards details!", roleId: req.session.roleId });
	}		
	else {
	  res.render('displayGuard', { guardId: req.param('guardId'), roleId: req.session.roleId });
	}
	};

	
/*exports.displayClient = function(req, res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId == 2 && req.param("clientId") != req.session.userId){	
		res.render('errorPage',{errorMsg : "You are not allowed to see other client details!", roleId: req.session.roleId });
	}
	else if(req.session.roleId == 3) {
		res.render('errorPage',{errorMsg : "You are not allowed to see client details!", roleId: req.session.roleId });
	}		
	else {
		res.render('displayClient', { clientId: req.session.userId, roleId: req.session.roleId });
	}	  
	};*/
	
exports.displayReport = function(req, res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1' && req.session.roleId != '2'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId });
	}
	else {
	  res.render('displayReport', { userId: req.session.userId , roleId: req.session.roleId });
	}
	};
	
exports.displayBuilding = function(req, res){
	console.log("HIII");
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1' && req.session.roleId != '2'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {
	  res.render('displayBuilding', { roleId: req.session.roleId });
	}
	};

exports.searchClients = function(req, res){	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {	  
	  res.render('searchClients', { clientId: "", roleId: req.session.roleId });
	}
	};

exports.searchBuildings = function(req, res){ //divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {
	  res.render('searchBuildings', { roleId: req.session.roleId });
	}
	};
	
exports.searchReports = function(req, res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1' && req.session.roleId != '2'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {
		res.render('searchReports',{ userId : req.session.userId, roleId: req.session.roleId });
	}		 
	};

exports.searchAlerts = function(req, res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1' && req.session.roleId != '2'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {
		res.render('searchAlerts',{ userId : req.session.userId, roleId: req.session.roleId });
	}		 
	};
	
exports.searchGuard = function(req, res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {	
	res.render('searchGuard', { roleId: req.session.roleId });
	}	
};	
	
exports.createGuard = function(req,res){ 	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {	
	res.render('createGuard', { roleId: req.session.roleId });
	}
};

exports.createClient = function(req,res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		console.log('Invalid session. '+JSON.stringify(req.session));
		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else if(req.session.roleId !== 1) {
		res.send({'status':'Failed', error:'Only admin can create client.'});
	} else {
		var email = req.param("email"), password = req.param("password");
		var firstName = req.param("firstName"), lastName = req.param("lastName");
		var street = req.param("street");
		var city = req.param("city"), state = req.param("state"), zipCode = req
				.param("zipCode");
		var phoneNumber = req.param("phone"), ssn = req.param("ssn");
		var startDate = req.param("startDate"), endDate = req.param("endDate"), serviceFee = req
				.param("cost");

		console.log("In RMQC:createClient Module");
		console.log(req);
		if ((email !== undefined && password !== undefined
				&& firstName !== undefined && lastName !== undefined
				&& street !== undefined && city !== undefined
				&& zipCode !== undefined && phoneNumber !== undefined
				&& ssn !== undefined && startDate !== undefined && serviceFee !== undefined)
				&& (email !== "" && password !== "" && firstName !== ""
						&& lastName !== "" && street !== "" && city !== ""
						&& zipCode !== "" && phoneNumber !== "" && ssn !== ""
						&& startDate !== "" && serviceFee !== "")) {
			var msg_payload = {
				"email" : email,
				"password" : password,
				"roleId" : 2,
				"firstName" : firstName,
				"lastName" : lastName,
				"street" : street,
				"city" : city,
				"state" : state,
				"zipCode" : zipCode,
				"phoneNumber" : phoneNumber,
				"userSSN" : ssn,
				"startDate" : startDate,
				"endDate" : endDate,
				"serviceFee" : serviceFee,
				"request" : "createClient"
				//requestQueue : "client_queue"
			};
			console.log("In RMQC:calling Client Service for create client");
			mq_client.make_request('client_queue', msg_payload, function(err,
					results) {
				console.log("In RMQC:Got return call Client Service");
				console.log('error: '+err);
				console.log('result from backend is: '+JSON.stringify(results));
				if (err || results.error) {
					console.log(results.error);
					res.send({error:results.error, status : 'Failed'});
				}// Error check
				else {
					console.log(JSON.stringify(results)+'..');
					req.session.newClientId = results.clientId;
					req.session.clientFirstName = firstName;
					req.session.clientLastName = lastName;
					console.log('Creation of user successfull. Session data is '+req.session);
					res.send({
						'msg' : 'Client Created Successfully', 'status':'Success'});
				}// Error check else
			});// Queue makeRequest call
		}// check not null
		else {
			// cstmError.throwException('Please fill all the manidatory fields',
			// res);
			res.send({status:'Failed', error:"Insufficient Details"});
			console.log('Something is missing..')
		}// check for mandatory fields else
	}
};

exports.createAlertType = function(req,res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {	
	res.render('createAlertType', { roleId: req.session.roleId });
	}	
};

exports.checkIn= function(req,res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '3'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {	
	res.render('checkIn', { roleId: req.session.roleId });
	}		
};

function getBuldingAndAlertsDetails(req,res, data){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
//		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else {
		var msg_payload = {
				"request" : "getBuldingAndAlertsDetails"
		};
		mq_client.make_request('client_queue', msg_payload, function(err,
				result) {
			if (err || result.status==='Failed') {
				console.log("error:" + result.error);
				res.send({
					"Status" : result.error
				});
			} else {
				console.log("Rendering with result");
				console.log(result);
				// res.profile = result;
				res.render('dashboard',{
					"alerts" : result.rows, "rows":data, roleId: req.session.roleId
				});
				// res.render('displayClient', {"profile":result});
			}
		});
	}
}
	

/******************************************************* GUARD ***********************************************/
exports.getGuardDetails = function(req,res){	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || (req.session.roleId == 3 && req.session.userId != req.param("guardId"))){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var guardId = req.param("guardId");		
	var msg_payload={ "url": "getGuardDetails", "guardId": guardId };

	if(guardId !== undefined && guardId !== "" )
	{		
		console.log("In POST Request = guardId:"+ guardId);
	
		mq_client.make_request('guard_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else				
			{							
				res.send({"Status" : "Success", "result": result});   															
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Please give a valid guard Id!"});
	}	}
}

exports.updateGuardDetails = function(req,res){		//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || (req.session.roleId == 3 && req.session.userId != req.param("guardId"))){
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var guardId = req.param("guardId");		
	var firstName = req.param("firstName");
	var lastName = req.param("lastName");
	var street = req.param("street");
	var city = req.param("city");
	var state = req.param("state");
	var zipcode = req.param("zipcode");
	var phoneNumber = req.param("phoneNumber");
	var userSSN = req.param("userSSN");
	var startDate = req.param("startDate");
	var endDate = req.param("endDate");
	var msg_payload;
	
	if (req.session.roleId == 1) {
		msg_payload={ "url": "updateGuardDetails", "guardId": guardId, "firstName": firstName, "lastName": lastName, "street": street, "city": city, "state": state, "zipcode": zipcode, "phoneNumber": phoneNumber, "userSSN": userSSN, "startDate": startDate, "endDate": endDate };
	}
	else if (req.session.roleId == 3) {
		msg_payload={ "url": "updateSelfGuardDetails", "guardId": guardId, "firstName": firstName, "lastName": lastName, "street": street, "city": city, "state": state, "zipcode": zipcode, "phoneNumber": phoneNumber };
	}

	console.log("msg_payload:"+JSON.stringify(msg_payload));
	if(guardId !== undefined && guardId !== "" )
	{		
		console.log("In POST Request = guardId:"+ guardId);
	
		mq_client.make_request('guard_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else				
			{			
				console.log("client: "+JSON.stringify(result));
				res.send({"Status" : "Success", "result": result});   															
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Please give a valid guard Id!"});
	}	}
}

exports.createNewGuard = function(req,res){		//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var email = req.param("email");
	var password = req.param("password");
	var firstName = req.param("firstName");
	var lastName = req.param("lastName");
	var street = req.param("street");
	var city = req.param("city");
	var state = req.param("state");
	var zipcode = req.param("zipcode");
	var userSSN = req.param("userSSN");
	var phoneNumber = req.param("phoneNumber");
	var startDate = req.param("startDate");
	var endDate = req.param("endDate");
	var msg_payload={ "url": "createNewGuard", "email": email, "password": password, "firstName": firstName, "lastName": lastName, "street": street, "city":city, "state":state, "zipcode":zipcode, "userSSN":userSSN, "phoneNumber":phoneNumber, "startDate":startDate, "endDate":endDate };

	if((email !== undefined && email !== "") && (password !== undefined && password !== "" ))
	{		
		console.log("In POST Request = email:"+ email + password);
	
		mq_client.make_request('guard_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else				
			{							
				res.send({"Status" : "Success"});   															
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Please check your input"});
	}	}
}


exports.deleteGuard = function(req,res){	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var guardId = req.param("guardId");		
	var msg_payload={ "url": "deleteGuard", "guardId": guardId };

	if(guardId !== undefined && guardId !== "" )
	{		
		console.log("In POST Request = guardId:"+ guardId);
	
		mq_client.make_request('guard_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else				
			{							
				res.send({"Status" : "Success"});   															
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Please give a valid guard Id!"});
	}	}
}

exports.getAllGuards = function(req,res){		//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var msg_payload={ "url": "getAllGuards" };
	
	console.log("In POST Request");

	mq_client.make_request('guard_queue', msg_payload, function(err, result){						
		if(result.error !== undefined && result.error !== ""){
			console.log("error:"+result.error);
			res.send({"Status":result.error});
		}
		else				
		{							
			res.send({"Status" : "Success", "result": result});   															
		}
	});	}
}



exports.getBuildings = function(req, res) {

	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else if(req.session.roleId !== 3){
		res.send({'status':'Failed', error:'Only guard can view assigned buildings.'});
	}else{
		var guardId = req.session.userId;
		var roleId = req.session.roleId;
		console.log("Request to get buildings of Guards Id ", +guardId);
//		console.log(req.session);
		
		var msg_payload = {
			'guardId' : guardId,
			'request' : 'getBuildings'
		};
		mq_client.make_request(
						'guard_queue',
						msg_payload,
						function(err, result) {
							if (result.error !== undefined
									&& result.error !== "") {
								console.log("error:" + result.error);
								res.status = result.status;
								res.send({
									"error" : result.error
								});
							} else {
								console
										.log("Got resonse from server for getBuldings request. The result is : ");
								console.log(result);
								// res.profile = result;
								res.status = result.status;
								res.send({
									'buildings' : result.buildings,
									'status' : 'Success'
								});
								// res.render('displayClient', {"profile":result});
							}
						});
	}
};

/**
 * Get all buildings owned by a prticular client
 */
exports.getBuildingsForClient = function(req, res) {

	var clientId = req.param("clientId");
	var ids = clientId.split(":");
	if (ids.length > 1) {
		clientId = ids[1];
	}
//	var guardId = req.session.userId;
	var roleId = req.session.roleId;
	console.log("Request to get buildings of Client with id ", +clientId);
	// console.log(req.session);
	var msg_payload = {
		clientId : clientId,
		'request' : 'getClientBuildings'
	};
	mq_client.make_request(
					'client_queue',
					msg_payload,
					function(err, result) {
						if (err || result.status==='Failed') {
							console.log("error:" + result.error);
							res.status = result.status;
							res.send({
								"error" : result.error, status: 'Failed'
							});
						} else {
							console
									.log("Got resonse from server for getBuldings request. The result is : ");
							console.log(result);
							// res.profile = result;
							res.status = result.status;
							res.send({
								'buildings' : result.buildings,
								'status' : 'Success'
							});
							// res.render('displayClient', {"profile":result});
						}
					});

};

exports.getCheckpoints = function(req, res) {
	console.log("Request to get buildings of Bulding Id ", req.param("buildingId"));
	console.log(req.session);
	var buildingId = req.param("buildingId");
	var userId = req.session.userId;
	if(userId === undefined){
		userId = 4;
	}
	var ids = buildingId.split(":");
	if(ids.length>1){
		buildingId = ids[1];
	}
	var msg_payload = {
		'userId' : userId,
		'buildingId' : buildingId,
		'url' : 'getCheckpoints'
	};
	mq_client.make_request('guard_queue', msg_payload, function(err, result) {
		if (result.error !== undefined && result.error !== "") {
			console.log("error:" + result.error);
			res.status = result.status;
			res.send({
				"error" : result.error
			});
		} else {
			console.log("Got resonse from server for getBuldings request. The result is : ");
			console.log(result);
			// res.profile = result;
			res.status = result.status;
			res.send({'checkPoints':result.checkPoints, 'status':result.status});
			// res.render('displayClient', {"profile":result});
		}
	});
};

exports.checkedIn = function(req,res){
	
	var checkinTime=req.param('checkinTime');
	var checkinDate=req.param('checkinDate');
	var timeArr=checkinTime.split(":");
	checkinDate=checkinDate+" "+timeArr[0]+":"+timeArr[1]+":00";
	var description=req.param('description');
	var msg_payload = {
		'checkpointId' : req.param('checkinId'),
		'description' : req.param('description'),
		'guardId' : req.session.userId,
		request : 'checkIn',
		'checkinDate':checkinDate
	};

	var currDate=new Date();
	if(description!=null||checkinDate.getDate<currDate.getDate){
		mq_client.make_request('guard_queue', msg_payload, function(err, result) {
			if (result.error !== undefined && result.error !== "") {
				console.log("error:" + result.error);
				res.status = result.status;
				res.send({
					"error" : result.error
				});
			} else {
				console.log('checkIn response is::');
				console.log(result);
				res.status = result.status;
				res.send({'checkPoints':result.checkPoints, 'status':"Success"});
			}
		});
	}
	else{
		res.status = "Date";
		res.send({'status':res.status,'errorMsg':"Date should be greater than current Date"});
	}
}

function getClientAndGuardDetails(req,res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
//		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else {
		var msg_payload = {
				"request" : "getClientAndGuardDetails"
		};
		mq_client.make_request('client_queue', msg_payload, function(err,
				result) {
			if (err || result.status==='Failed') {
				console.log("error:" + result.error);
				res.send({
					"Status" : result.error
				});
			} else {
				
				console.log("Rendering with result");
				console.log(result);
				// res.profile = result;
//				res.render('graphs',{
//					"rows" : result.rows
//				});
				getBuldingAndAlertsDetails(req,res,result.rows);
				// res.render('displayClient', {"profile":result});
			}
		});
	}
}

exports.graphs = function(req,res){
	res.render('graphs');
}


exports.searchGuard = function(req, res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '1'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {
	res.render('searchGuard',{ roleId: req.session.roleId });
	}
	};
		  //Mine
exports.searchingGuard=function(req,res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.send({Status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else if(req.session.roleId == 3 || req.session.roleId == 2){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
			  var firstName=req.param("firstName");
			  var lastName=req.param("lastName");
			  var buildingName=req.param("buildingName");
			  var email=req.param("email");
			  var SSN=req.param("ssn");
			  var startDate1=req.param("startDate1");
			  var endDate1=req.param("endDate1");
			  var startDate2=req.param("startDate2");
			  var endDate2=req.param("endDate2");
			  var backgroundStatus=req.param("backgroundStatus");
			  
			  // Need to SSN validation before sending
			  console.log(firstName+""+buildingName+""+email+" "+SSN+""+startDate1+" "+endDate1+""+startDate2+""+backgroundStatus);
				
			console.log("In Search Guard Request");
			if(email!==null||buildingName!==null || firstName!==null||lastName!==null||SSN!==null||startDate1!==null || endDate1!==null || startDate2!==null || endDate2!==null 
					|| backgroundStatus!==null ||startDate1!=='' || endDate1!=='' || startDate2!=='' || endDate2!=='')
			{
			var msg_payload={"firstName": firstName,"lastName":lastName,"buildingName": buildingName,"email":email,
					"SSN":SSN,"startDate1":startDate1,"endDate1":endDate1,"startDate2":startDate2,"endDate2":endDate2,"backgroundStatus":backgroundStatus,"url":"searchGuard"};
			mq_client.make_request('guard_queue',msg_payload, function(err,results){
				console.log("Guard_Services queue");
				// To Write 
				console.log(results);
				/*for(var i=0;i<results.length;i++){
					console.log(results.length);
					console.log(results[i]+"and");}*/
					if(results.guards == null)
					{					
						console.log("Hiii in error");
						res.send({"Status" : "Error","errorMsg":"No guards found match the search criteria."});
					}
					else
					{		
						console.log("Hiii in success");
						res.send({"results":results,"Status":"Success"});   											
				
					} 
			});
			}
			else{
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
			}
		};
/******************************************************* GUARD END ******************************************************/

/******************************************************** BUILDING ******************************************************/
exports.searchBuildingByName = function(req,res){	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var searchString = req.param("searchString");		
	var msg_payload={ "url": "searchBuildingByName", "searchString": searchString };
	
	console.log("In POST Request = searchString:"+ searchString);

	if(searchString != 'undefined' && searchString != "" )
	{		
		console.log("In POST Request = searchString:"+ searchString);
	
		mq_client.make_request('building_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else
			{								
				if(result.rows.length > 0)
				{										
					res.send({"Status" : "Success", "rows": result.rows});   											
				}
				else
				{										
					res.send({"Status" : "No matches found!"});
				}
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Please enter a search string and then search!"});
	}	}
}

exports.getCheckpointsByBuilding = function(req,res){	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var buildingId = req.param("buildingId");		
	var msg_payload={ "url": "getCheckpointsByBuilding", "buildingId": buildingId };

	if(buildingId !== undefined && buildingId !== "" )
	{		
		console.log("In POST Request = buildingId:"+ buildingId);
	
		mq_client.make_request('building_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else
			{	console.log(JSON.stringify(result));							
				if(result.rows.length > 0)
				{										
					res.send({"Status" : "Success", "rows": result.rows});   											
				}
				else
				{										
					res.send({"Status" : "No checkpoints found!"});
				}
			}
		});
	}		
	else
	{		
		res.send({"Status" : "No building selected!"});
	}	}
}

exports.updateCheckpointGuard = function(req,res){		//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var originalData = req.param("originalData");		
	var updatedData = req.param("updatedData");	
	var msg_payload={ "url": "updateCheckpointGuard", "originalData": originalData, "updatedData": updatedData };

	console.log("msg_payload:"+JSON.stringify(msg_payload));
	if((originalData !== undefined && originalData !== "") && (updatedData !== undefined && updatedData !== ""))
	{		
		console.log("In POST Request = updatedData:"+ JSON.stringify(updatedData) + "\n originalData:"+JSON.stringify(originalData));
	
		mq_client.make_request('building_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else				
			{			
				console.log("success");
				res.send({"Status" : "Success"});   															
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Invalid input!"});
	}	}
}

exports.unassignGuard = function(req,res){		//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var checkinId = req.param("checkinId");			
	var msg_payload={ "url": "unassignGuard", "checkinId": checkinId };

	console.log("msg_payload:"+JSON.stringify(msg_payload));
	if(checkinId !== undefined && checkinId !== "")
	{		
		console.log("In POST Request = checkinId:"+ checkinId);
	
		mq_client.make_request('building_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else				
			{							
				res.send({"Status" : "Success"});   															
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Invalid input!"});
	}	}
}

exports.getBuildingsForGuards=function(req,res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId == '2'||req.session.roleId == '1'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId});
	}
	else {
	var msg_payload;
	msg_payload={"guardId":req.session.userId,"url":"getBuildingsByGuards"};
	mq_client.make_request('guard_queue',msg_payload, function(err,results){
	console.log("Guard Services queue");
	console.log(results);
	/*for(var i=0;i<results.length;i++){
		console.log(results.length);
		console.log(results[i]+"and");}*/
		if(results.length == 0)
		{					
			console.log("Hiii in error");
			res.send({"Status" : "Error","errorMsg":"Please Provide proper search Criteria"});
		}
		else
		{		
			console.log("Hiii in success");
			res.send({"results":results,"Status":"Success"});							
	
		} 
	});}
};

/******************************************************* BUILDING END ***************************************************/




/********************************************************* CLIENT **********************************************************/

exports.searchClientByName = function(req,res){		//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var searchString = req.param("searchString");		
	var msg_payload={ "url": "searchClientByName", "searchString": searchString };

	if(searchString !== undefined && searchString !== "" )
	{		
		console.log("In POST Request = searchString:"+ searchString);
	
		mq_client.make_request('client_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else
			{								
				if(result.rows.length > 0)
				{										
					res.send({"Status" : "Success", "rows": result.rows});   											
				}
				else
				{										
					res.send({"Status" : "No matches found!"});
				}
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Please enter a search string and then search!"});
	}	}
}

exports.getAllClients = function(req,res){		//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var msg_payload={ "url": "getAllClients"};
		
		console.log("In POST Request");
	
		mq_client.make_request('client_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else
			{								
				if(result.rows.length > 0)
				{										
					res.send({"Status" : "Success", "rows": result.rows});   											
				}
				else
				{										
					res.send({"Status" : "No clients found!"});
				}
			}
		});		}
}


exports.getCheckpointsByBuilding = function(req,res){	//divya
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId != 1 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	var buildingId = req.param("buildingId");		
	var msg_payload={ "url": "getCheckpointsByBuilding", "buildingId": buildingId };

	if(buildingId !== undefined && buildingId !== "" )
	{		
		console.log("In POST Request = buildingId:"+ buildingId);
	
		mq_client.make_request('building_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else
			{								
				if(result.rows.length > 0)
				{										
					res.send({"Status" : "Success", "rows": result.rows});   											
				}
				else
				{										
					res.send({"Status" : "No checkpoints found!"});
				}
			}
		});
	}		
	else
	{		
		res.send({"Status" : "No building selected!"});
	}	}
}


exports.displayClient = function(req, res) {
	console.log("Client Id:", req.param("clientId"));
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId == 2 && req.param("clientId") != req.session.userId){	
		res.render('errorPage',{errorMsg : "You are not allowed to see other client details!", roleId: req.session.roleId });
	}
	else if(req.session.roleId == 3) {
		res.render('errorPage',{errorMsg : "You are not allowed to see client details!", roleId: req.session.roleId });
	}		
	else {		
	var clientId = req.params.clientId;
	var msg_payload = {
		"clientId" : clientId,
		"url" : "getClient"
	};

	if ((clientId !== undefined) && (clientId !== "")) {

		mq_client.make_request('client_queue', msg_payload, function(err,
				result) {
			if (result.error !== undefined && result.error !== "") {
				console.log("error:" + result.error);
				res.send({
					"Status" : result.error
				});
			} else {
				if (result.profile.userId === undefined) {
					result.profile.userId = clientId;
				}
				console.log("Rendering with result");
				console.log(result);

				// res.profile = result;
				res.send({
					"profile" : result
				});
				// res.render('displayClient', {"profile":result});
			}
		});
	} else {
		res.send({
			"Status" : "Error"
		});
	}}

};

exports.deleteClient = function(req, res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else if(req.session.roleId !== 1){
		res.send({'status':'Failed', error:'Only admin can delete client.'});
	}else{
		console.log("Client Id:", req.param("clientId"));
		var clientId = req.params.clientId;
		var clients = clientId.split(':');
		if(clients.length >1){
			clientId = clients[1];
			console.log(clientId);
			console.log("before"+clients[1]+clientId);
		}
		console.log(clients);
		var msg_payload = {
			"clientId" : clientId,
			"url" : "deleteClient"
		};

		if ((clientId !== undefined) && (clientId !== "")) {
			mq_client.make_request('client_queue', msg_payload, function(err,
					result) {
				if (result.error !== undefined && result.error !== "") {
					console.log("error:" + result.error);
					res.status = result.status;
					res.send({
						"error" : result.error
					});
				} else {
					console.log("Rendering with result");
					console.log(result);
					// res.profile = result;
					res.status = result.status;
					res.send(result);
					// res.render('displayClient', {"profile":result});
				}
			});
		} else {
			res.send({
				"status" : "Error"
			});
		}
	}
};




exports.updateClient = function(req, res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else if(req.session.roleId !== 1 && req.session.roleId !== 2) {
		console.log(req.session.roleId );
		
		res.send({'status':'Failed', error:'Only admin can create client.'});
	} else {
		var clientDetails = req.param('clientDetails');
		clientDetails.url = 'updateClient';
		clientDetails.userId = clientDetails.userId;
		console.log("Before publishing to que");
		console.log(clientDetails);

		mq_client.make_request('client_queue', clientDetails,
				function(err, results) {
					console.log("In RMQC:Got return call Client Service");
					if (results.error) {
						console.log(results.error);
						res.send(results.error);
					}// Error check
					else {
						res.send({
							'msg' : 'Client Updated Successfully',
							'status' : 'Success'
						});
					}// Error check else
				});// Queue makeRequest call
	}

}
/************************************************************ CLIENT END *****************************************************/

/************************************************************ LOGIN ****************************************************/
exports.login = function(req,res){		
	var email = req.param("email");
	var password = req.param("password");		
	var msg_payload={ "url": "login", "email": email, "password": password };

	if((password !== undefined && email !== undefined) && (password !== "" && email !== ""))
	{		
		console.log("In POST Request = Email:"+ email+" "+password);
	
		mq_client.make_request('login_queue', msg_payload, function(err, result){						
			if(result.error !== undefined && result.error !== ""){
				console.log("error:"+result.error);
				res.send({"Status":result.error});
			}
			else
			{								
				if(result.userId !== undefined && result.userId !== "")
				{					
					req.session.userId = result.userId;	    	  	
					req.session.roleId = result.roleId;
					res.send({"Status" : "Success", "userId": result.userId, "roleId": result.roleId});   											
				}
				else
				{										
					res.send({"Status" : "Error"});
				}
			}
		});
	}		
	else
	{		
		res.send({"Status" : "Error"});
	}	
};

exports.logout = function(req,res){									
    if(req.session.userId)
    	{			    	
    		req.session.destroy();
    		//res.send({"Status":"Logged out"});
    		res.render('index');	
    	}
    else
    	{    		
    		res.render('errorPage',{errorMsg : "No session to destroy! ", roleId: req.session.roleId});
    	}						
};

/*********************************************************** LOGIN END *************************************************/



/*********************************************************** PROMISE ********************************************************/
//Creating a raw promise.
function query(qu, input) {
	var defered = q.defer();
	var connection = mysql.getConnection();
	console.log("Querying db.. " + qu + input);
	connection.query(qu, input, function(err, rows) {
		console.log("Db query output is: " + JSON.stringify(rows));
		if (err) {
			defered.reject(err); // rejects the promise with err as the value
		} else {
			defered.resolve(rows); // fulfills the promise with `rows` as the
			// value
		}
	})
	return defered.promise;
}

// Test api working with promises.
exports.promis = function(req, res) {
	query('SELECT buildingId, buildingName, bLatitude, bLongitude, street FROM building where buildingId IN (SELECT DISTINCT buildingId FROM checkinpoints WHERE guard = ?)',4).then(console.log, console.error);
};
/*********************************************************** PROMISE ********************************************************/

exports.saveAlertType = function(req, res){

	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else if(req.session.roleId !== 1){
		res.send({'status':'Failed', error:'Only admin can create alertTyepe.'});
	}else{
		console.log(req);
		var alertName = req.param('alertName');
		var recipients = req.param('recipients');
		console.log('recipients...'+JSON.stringify(recipients));
		var recipient = '';
		if(recipients.client === 'YES'){
			if(recipients.guard === 'YES'){
				recipient = 'All';
			} else {
				recipient = 'Client';
			}
		} else {
			if(recipients.guard === 'YES'){
				recipient = 'Guard';
			} else {
				res.send({Status:'Failed', error:'Please select atleast one recipients.'});
			}
		}
		var msg_payload = {
			'alertName' : alertName,
			'recipients' : recipient,
			'request' : 'saveAlert'};
		console.log('Requestig Server to save alert type with message payload: '+JSON.stringify(msg_payload));
		mq_client.make_request('guard_queue', msg_payload, function(err, result) {
			if (result.error !== undefined && result.error !== "") {
				console.log("error:" + result.error);
				res.status = result.status;
				res.send({
					"error" : result.error
				});
			} else {
				console.log("Got resonse from server for getBuldings request. The result is : ");
				console.log(result);
				// res.profile = result;
				res.status = result.status;
				res.send({'checkPoints':result.checkPoints, 'status':result.status});
				// res.render('displayClient', {"profile":result});
			}
		});
	}
}

exports.saveAlert = function(req,res){
	console.log('SaveAlert request recieved.\nValidating user.');
	if(req.session===undefined || req.session.userId === undefined){
		console.log('Invalid user request. Sending response with error code 500.');
		res.send({status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else {
		var dataToSend = {};
		dataToSend.alert = req.param('alert');
		dataToSend.request = 'submitAlert';
		dataToSend.guardIg = req.session.userId;
		mq_client.make_request('guard_queue', dataToSend, function(err, result) {
			if(err){
				res.send({status : 'Failed'});
			} else if (result.status = 'Success'){
				res.send({status:'Success'});
			}
			else {
				res.send({status : 'Failed'});
			}
		});
	}
}

exports.getAllAlerts = function(req, res){
	var msg_payload = {
			'request':'getAllAlerts'
	};
	mq_client.make_request('guard_queue', msg_payload, function(err, result) {
		if (result.status === 'Failed') {
			console.log("error:" + result.error);
			res.status = result.status;
			res.send({
				"error" : result.error
			});
		} else {
			console.log("Got resonse from server for getAllAlerts request. The result is : ");
			console.log(result);
			res.status = result.status;
			res.send({'alerts':result.data, 'status':result.status});
		}
	});
}

/***********************************************************REPORTS************************************************************/
exports.displayReport = function(req, res){
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.send({Status:'Failed',error:'Please login before continue.',errorCodeNo:'500'});
	} else if(req.session.roleId== 3 ) {
		res.send({'Status':'Failed', error:'You are not authorized to do this action.'});
	} else {
	  res.render('displayReport', {roleId: req.session.roleId});
	}
};

exports.submitAlert = function(req, res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');	
	}
	else if(req.session.roleId != '3'){	
		res.render('errorPage',{errorMsg : "You are not authorized to view this page!", roleId: req.session.roleId });
	}
	else {
	  res.render('submitAlert', { roleId: req.session.roleId });
	}	
};

	  //mine
exports.showReport=function(req,res) {
		 // var userId=req.param("userId");
		 // var reportId=req.param("reportId");
		 //-------------------------------------------------Uncomment these values--
		 
		  var buildingId=req.param("buildingId");
		  var createTime=req.param("createTime");
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if((req.session.roleId == 3 && req.session.userId != req.param("guardId"))){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
		
		 // var buildingId=2;
		//  var createTime="2014-11-11";
		console.log("In displayReport Request and Requesting for:"+buildingId);
		if(buildingId!==null || createTime!==null)
		{
		var msg_payload={"buildingId":buildingId,"createTime":createTime,"url":"displayReport"};
		mq_client.make_request('report_queue',msg_payload, function(err,results){
			console.log("Reports_services queue");
			
			console.log(results.reportDetails);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code!=401){
					console.log("valid result");
					
					 res.send({"reportDetails":results.reportDetails,"maintenance":results.maintenance,"parking":results.parking,
						 "servicecalls":results.servicecalls,"Rcode":results.Rcode,"Pcode":results.Pcode,"Mcode":results.Mcode,"Scode":results.Scode,"Icode":results.Icode,
						 "incidents":results.incidents,"checkindata":results.checkindata,"status":"success"});	  
				}
				else {    	
					console.log("Invalid results");
					res.send({"Status":"Error","reportDetails":results.reportDetails,"maintenance":results.maintenance,"parking":results.parking,
						 "servicecalls":results.servicecalls,"incidents":results.incidents,"checkindata":results.checkindata});
				}
			}  
		});
		}
		else{
			console.log("Invalid Login");
			res.send({"login":"Fail"});
		}	}
	};

	exports.createReport = function(req,res){
		if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
			res.render('index');
		} else if(req.session.roleId!= 3 ) {
			res.render('errorPage',{errorMsg : "You are not allowed to create reports!", roleId: req.session.roleId });
		} 
		else {			
			  res.render('createReport', { userId: req.session.userId , roleId: req.session.roleId });
		}				
	};
	
	exports.creatingReport=function(req,res){
		if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
			res.render('index');
		} else if(req.session.roleId == 1 || req.session.roleId == 2){
			res.send({'Status':'Failed', error:'You are not authorized to see this page'});
		} else {
		var msg_payload=null;
		var description=req.param("description");
		var vehicleNo=req.param("vehicleNo");
		var buildingName=req.param("buildingName");
		var violationType=req.param("violationType");
		var violationDate=req.param("violationDate");
		var vehicleModel=req.param("vehicleModel");
		var parkingLotNo=req.param("parkingLotNo");
		var violationTime=req.param("violationTime");
		console.log("Inside creating report"+violationTime+"Date"+violationDate);
		
		//violationDate=new Date(violationDate);
		var timeArr=violationTime.split(":");
		violationDate=violationDate+" "+timeArr[0]+":"+timeArr[1]+":00";
		console.log("Inside creating report"+violationTime+"Date"+violationDate);
		
		if(description!==null||description!==undefined){
		
			msg_payload={"description":description,"buildingName":buildingName,"violationType":violationType,"parkingLotNo":parkingLotNo,
					"vehicleNo":vehicleNo,"vehicleModel":vehicleModel,"violationDate":violationDate,"url":"createReport"};
			
			console.log("hi");
			mq_client.make_request('report_queue',msg_payload, function(err,results){
			console.log("Report_Services queue");
			// To Write 
			console.log(results);
			/*for(var i=0;i<results.length;i++){
				console.log(results.length);
				console.log(results[i]+"and");}*/
				if(results.code != 200)
				{					
					console.log("Hiii in error");
					res.send({"Status" : "Error","errorMsg":"Please Provide proper search Criteria"});
				}
				else
				{		
					console.log("Hiii in success");
					res.send({"results":results,"Status":"Success"});   											
			
				} 
			});
			}}
		};

/*************************************************************displayBuilding and dashboard*****************************************/

exports.deleteBuilding = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || req.session.roleId == 3){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var buildingId = req.param("buildingId"); //or get the id from session variable
	var msg_payload = {"url":"deleteBuilding","buildingId": buildingId};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("deleteBuilding error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {					
				res.send({"status":"Success"});
			}
			else {
				res.send({"status" : "Error","errorMsg":""});
			}
		}
	});}
};

exports.deleteCP = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || req.session.roleId == 3){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var checkinId = req.param("checkinId");
	var msg_payload = {"url":"deleteCP","checkinId": checkinId};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("deleteCP error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {					
				res.send({"status":"Success"});
			}
			else {
				res.send({"status" : "Error","errorMsg":""});
			}
		}
	});}
};

exports.createCP = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || req.session.roleId == 3){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var buildingId = req.param("buildingId");
	var latitude = req.param("latitude");
	var longitude = req.param("longitude");
	var cName = req.param("cName");
	var msg_payload = {"url":"createCP","buildingId": buildingId,"latitude": latitude,"longitude": longitude,"cName": cName};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("createCP error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {					
				res.send({"status":"Success","checkinId":results.results});
			}
			else {
				res.send({"status" : "Error","errorMsg":""});
			}
		}
	});}
};

exports.updateCP = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || req.session.roleId == 3){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var cName = req.param("cName");
	var checkinId = req.param("checkinId");
	var msg_payload = {"url":"updateCP","cName": cName,"checkinId":checkinId};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("updateCP error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {					
				res.send({"status":"Success"});
			}
			else {
				res.send({"status" : "Error","errorMsg":""});
			}
		}
	});}
};

exports.buildingDetails = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 3) {
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var buildingId = req.param("buildingId"); //or get the id from session variable
	var msg_payload = {"url":"buildingDetails","buildingId": buildingId};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("buildingDetails error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {
				res.send({"status":"Success","results":results.results});
			}
			else {
				res.send({"status":"Error","errorMsg":"Invalid data"});
			}
		}
	});}
};

exports.updateBuilding = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || req.session.roleId == 3){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var msg_payload = {"url":"updateBuilding","bDetails":req.param("bDetails"),"buildingId":req.param("buildingId")};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("updateBuilding error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {					
				res.send({"status":"Success"});
			}
			else {
				res.send({"status" : "Error","errorMsg":""});
			}
		}
	});}
};

exports.dashboardMap = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else {
	var userId = req.session.userId;
	var roleId = req.session.roleId;
	var msg_payload = {"url":"dashboardMap","userId":userId,"roleId":roleId};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("dashboardMap error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {					
				res.send({"status":"Success","bJson":results.bJson,"cJson":results.cJson,"gJson":results.gJson});
			}
			else {
				res.send({"status" : "Error","errorMsg":""});
			}
		}
	});}
};

exports.createBuilding = function(req,res) {
	if (req.session === undefined || req.session.userId === undefined || req.session.roleId === undefined) {
		res.render('index');
	} else if(req.session.roleId == 2 || req.session.roleId == 3){
		res.send({'Status':'Failed', error:'You are not authorized to see this page'});
	} else {
	var msg_payload = {"url":"createBuilding","bDetails":req.param("bDetails")};
	mq_client.make_request('building_queue',msg_payload, function(err,results){
		if(err) {
			console.log("createBuilding error" +err);
			throw err;
		}
		else {
			if(results.code === 200) {					
				res.send({"status":"Success","results":results});
			}
			else {
				res.send({"status" : "Error","errorMsg":""});
			}
		}
	});}
};
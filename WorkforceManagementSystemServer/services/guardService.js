var mysql = require('./mysql');
var sqlExceptions = require('./sqlExceptions');
var q = require("Q");
var bcrypt = require('./bCrypt');
/*
 * To Encrypt Password with Salt * 
 * 
 * */
function encryptPassword(pwd) {
	//var bcrypt = require('bcryptjs');
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(pwd, salt);	
	return hash;
}

function handle_request(msg, callback){
	console.log("handlerequest");
	var res = {};
	/*************************************************************Get guard details******************************************************************************/	
	if(msg.url==="getGuardDetails"){
		console.log("url match - getGuardDeatils!!!!!!!!!");

		var guardId = msg.guardId;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("select ud.firstName, ud.lastName, ud.userSSN, ud.street, ud.city, ud.state, ud.zipcode, ud.phoneNumber, DATE_FORMAT(g.startDate,'%Y-%m-%d') as startDate, DATE_FORMAT(g.endDate,'%Y-%m-%d') as endDate, s.slotStartTime, s.slotEndTime from userdetails ud, guard g, user u, slots s where g.guardId = ? and ud.userId = g.guardId and ud.userId = u.userId and g.currentSlotId = s.slotId and u.deleteFlag = 'N'", [guardId], function(err, rows){						
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
				callback(null, res);
			}
			else if(rows.length > 0){	 				
						res.guardDetails = rows[0];
						connection.query("select distinct b.buildingId, b.buildingName from building b, checkinpoints c where c.guard = ? and c.buildingId = b.buildingId and c.deleteFlag = 'N'", [guardId], function(err,buildings) {							
							res.buildings = buildings;
							connection.query("select c.checkinId, c.latitude, c.longitude, b.buildingName from checkinpoints c, building b where c.buildingId = b.buildingId and c.guard = ? and c.deleteFlag = 'N'", [guardId], function(err,checkpoints) {
								res.checkpoints = checkpoints;
									console.log("res: "+JSON.stringify(res));
								
								/************** End Connection******************************************/	
								connection.end();		
								/*********************************************************************/
								callback(null, res);
							});															
						});																									
				}				
			else{
				res.error="No matches found!";
				callback(null, res);	
			}
		});
	}
	
	/*************************************************************Update guard******************************************************************************/	
	else if(msg.url==="updateGuardDetails") {
		console.log("url match");
		
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("UPDATE userdetails SET firstName = ?, lastName = ?, street = ?, city = ?, state = ?, zipcode =?, phoneNumber = ?, userSSN = ? WHERE userId = ?", [msg.firstName, msg.lastName, msg.street, msg.city, msg.state, msg.zipcode, msg.phoneNumber, msg.userSSN, msg.guardId], function(err, userUpdateResponse){	 			
			connection.end();
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";
				callback(null,res);
			}					
			else{ connection = mysql.getConnection();
				connection.query("UPDATE guard SET startDate = ?, endDate = ? WHERE guardId = ?", [msg.startDate, msg.endDate, msg.guardId], function(err, guardUpdateResponse){
					connection.end();
					if(err){
					res.error=err;
					callback(null,res);
				}
				else
				{
					res.Status = "Success";
					callback(null, res);
				}
				});				
			}
		});
	}
	
	/*************************************************************Update self guard******************************************************************************/	
	else if(msg.url==="updateSelfGuardDetails"){
		console.log("url match");
		
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("UPDATE userdetails SET firstName = ?, lastName = ?, street = ?, city = ?, state = ?, zipcode =?, phoneNumber = ? WHERE userId = ?", [msg.firstName, msg.lastName, msg.street, msg.city, msg.state, msg.zipcode, msg.phoneNumber, msg.guardId], function(err, userUpdateResponse){	 			
			connection.end();
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
				callback(null,res);
			}					
			else{				
					res.Status = "Success";
					callback(null, res);							
			}
		});
	}
	
	
	/*************************************************************Create guard******************************************************************************/	
	else if(msg.url==="createNewGuard"){
		console.log("url match");
		var encpassword=encryptPassword(msg.password);
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("insert into user (email, password, roleId) values (?, ?, 3)", [msg.email, encpassword], function(err, insertResponse){	 			
			connection.end();
			if(err){
				console.log(err);
				if(err.errno === 1062)
				{
					res.error="Email already exists!";
				}					
				else if(err.errno === 1366)
				{
					res.error="Please check the input and try again!";
				}
				else
				{
					res.error="Something went wrong. Please try again!";	
				}
				
				callback(null,res);
			}					
			else{connection = mysql.getConnection();
				console.log(insertResponse);
				connection.query("insert into userdetails (userId, firstName, lastName, street, city, state, zipcode, userSSN, phoneNumber) values (?, ?, ?, ?, ?, ?, ?, ?, ?)", [insertResponse.insertId, msg.firstName, msg.lastName, msg.street, msg.city, msg.state, msg.zipcode, msg.userSSN, msg.phoneNumber], function(err, userDetailsInsertResp){
					connection.end();
					if(err){
					if(err.errno === 1062)
					{
						res.error="SSN already exists to another user!";
					}	
					else if(err.errno == 1366)
					{
						res.error="Please check the input and try again!";
					}					
					else
					{
						res.error="Something went wrong. Please try again!";
					}
					callback(null,res);
				}
				else
				{connection = mysql.getConnection();
					console.log(userDetailsInsertResp);
					connection.query("insert into guard (guardId, startDate, endDate, currentSlotId, backgroundStatus) values (?, ?, ?, 1, 'In Progress')", [insertResponse.insertId, msg.startDate, msg.endDate], function(err, guardInsertResp){
						connection.end();
						if(err){
							res.error="Something went wrong. Please try again!";
							callback(null,res);
						}
						else
						{
							console.log(guardInsertResp);							
							res.Status = "Success";
							callback(null, res);
						}
						});					
				}
				});						
			}
		});
	}
	
	/*************************************************************Delete guard******************************************************************************/	
	else if(msg.url==="deleteGuard"){
		console.log("url match");
		var guardId = msg.guardId;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		query = connection.query("select checkinId from checkinpoints where guard = ?", [guardId], function(err, checkpoints){
			connection.end();
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
				callback(null,res);			
			}	
			else if(checkpoints.length > 0)
			{				
				res.error="This guard is assigned to checkpoints. Please unassign and retry deleting.";	
				callback(null,res);	
			}
			else
			{connection = mysql.getConnection();
				var query = connection.query("update user set deleteFlag = 'Y' where userId = ?", [guardId], function(err, guardUpdateResponse){	 			
					connection.end();
					if(err){
						console.log(err);
						res.error="Something went wrong. Please try again!";	
						callback(null,res);			
					}					
					else{						
								res.Status = "Success";
								callback(null, res);	
							
					}
				});

			}
		});
	}
	
	/*************************************************************Get all guards******************************************************************************/	
	else if(msg.url==="getAllGuards"){
		console.log("url match");		
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("select u.userId as guardId, concat(ud.firstName, ' ', ud.lastName) as guardName from userdetails ud, user u where ud.userId = u.userId and u.deleteFlag = 'N'", [], function(err, rows){	 			
			connection.end();
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
				callback(null,res);			
			}					
			else{
				if(rows.length > 0)
				{
					res = rows;
					callback(null,res);
				}
				else
				{
					res.error = "No guards are active in the system";
					callback(null,res);
				}
				res.Status = "Success";
				callback(null, res);	
			}
		});
	}
	
	
	/**
	 * Get all alert types created by the admit.
	 */
	else if (msg.request === 'getAllAlerts'){
		console.log('In get all alert types modue..')
		var connection = mysql.getConnection();
		var query = connection.query('SELECT * FROM alerttype',[], function(error, rows){
			connection.end();
			if(error){
				res.status = 'Failed';
				res.err = error;
				res.error='Something went wrong';
				callback(null,res);
			} else {
				res.status = 'Success';
				res.data = rows;
				console.log('Got all alert types.. '+rows);
				callback(null,res);
			}
		})
	}
	
	/**
	 * Get all buildings assigned to to a guard. 
	 */
	else if (msg.request === "getBuildings" && msg.guardId) {
		console.log('In getBuildings block...' + JSON.stringify(msg));

		var connection = mysql.getConnection();
		var query = connection
				.query(
						'SELECT buildingId, buildingName, bLatitude, bLongitude, street FROM building where buildingId IN (SELECT DISTINCT buildingId FROM checkinpoints WHERE guard = ?)',
						msg.guardId,
						function(error, rows) {
							if (error) {
								console.log(JSON.stringify(error));
								res.status = "Failed";
								res.error = "Something went wrond.";
								res.err = error;
								callback(null, res);
							} else {
								console.log(JSON.stringify(rows));
								if (rows.length > 0) {
									res.status = "Success";
									res.buildings = rows;
								} else {
									res.status = "Failed";
									res.error = "Buildings not yet assigned for the guard!!";
								}
								callback(null, res);
							}
						});

		// query('SELECT buildingId, buildingName, bLatitude, bLongitude, street
		// FROM building where buildingId IN (SELECT DISTINCT buildingId FROM
		// checkinpoints WHERE guard =
		// ?)',msg.guardId).then(function(rows){console.log(JSON.stringify(rows))},function(error){console.log(error)});
		// var guardId = msg.guardId;
		// query('select * from user').then(function(rows){
		// console.log(JSON.stringify(rows));
		// }, function(error){
		// console.log(JSON.stringify(error));
		// });
		// query(
		// "SELECT buildingId, buildingName, bLatitude, bLongitude, street FROM
		// building where buildingId IN (SELECT DISTINCT buildingId FROM
		// checkinpoints WHERE guard = ?)",
		// [4]).then(function(rows) {
		// console.log('ourput of query is...');
		// console.log(rows);
		// if (rows.length > 0) {
		// res.status = "Success";
		// res.buildings = rows;
		// } else {
		// res.status = "Failed";
		// res.error = "Buildings not yet assigned for the guard!!";
		// }
		// callback(null, res);
		// }, function(err) {
		//			res.status = "Failed";
		//			res.error = "Something went wrond.";
		//			res.err = err;
		//			callback(null, res);
		//		});
	} else if (msg.url === "getCheckpoints" && msg.buildingId && msg.userId) {

		var connection = mysql.getConnection();
		var query = connection
				.query(
						'SELECT * from checkinpoints WHERE guard = ? AND buildingId =?',
						[ msg.userId, msg.buildingId ],
						function(error, rows) {
							if (error) {
								console.log(JSON.stringify(error));
								res.status = "Failed";
								res.error = "Something went wrong.";
								res.err = error;
								callback(null, res);
							} else {
								if (rows.length > 0) {
									res.status = "Success";
									res.checkPoints = rows;
								} else {
									res.statue = "Failed";
									res.error = "Building doesn't contain any checkpoints.";
								}
								callback(null, res);
							}
						});

		// query("SELECT * from checkinpoints WHERE guard = ? AND buildingId
		// =?",
		// [ msg.userId, msg.buildingId ]).then(function(rows) {
		// if (rows.length > 0) {
		// res.status = "Success";
		// res.checkPoints = rows;
		// } else {
		// res.statue = "Failed";
		// res.error = "Building doesn't contain any checkpoints.";
		// }
		// callback(null, res);
		// }, function(err) {
		// res.status = "Failed";
		// res.error = "Something went wrong.";
		// res.err = err;
		//			callback(null, res);
		//		})
		// SELECT * from checkinpoints WHERE guard = 4 AND buildingId =1
//		guardId, checkinId, checkinTime, disposition, slotId, guardId, id
	} else if (msg.request === "saveAlert" && msg.alertName && msg.recipients) {

		var data = {
			"alertName" : msg.alertName,
			"recipients" : msg.recipients
		};
		console.log('In saveAlert module.. data is '+data);
		var connection = mysql.getConnection();
		var query = connection
				.query("INSERT INTO alerttype (alertName, recipients) VALUES (?, ?)", [msg.alertName, msg.recipients], function(error, rows){
					if(error) {
						res.status = 'Failed';
						console.log(error);
						callback(null, res);
					} else {
						res.status = 'Success';
						console.log(rows);
						callback(null, res);
					}
					
				});
//		query("INSERT INTO alerttype VALUES", data).then(function(rows) {
//			res.status = 'Success';
//			callback(null, res);
//		}, function(error) {
//			res.status = 'Failed';
//			callback(null, res);
//		})
	} 

	else if(msg.request === 'submitAlert'){
		console.log('Recieved submitAlert request.');
		var connection = mysql.getConnection();
		var query = connection.query('INSERT INTO alerts ( description, severity, buildingId, guardId, alertTypeId) VALUES (?,?,?,?,?)',[msg.alert.description,msg.alert.severity,msg.alert.building,msg.guardIg,msg.alert.alertId],function(error,rows){
			if(error){
				console.log('Save alert Failed. Error code is '+error);
				res.status = 'Failed';
				callback(null,res);
			} else {
				console.log('Saved alert Successfully.');
				res.status = 'Success';
				callback(null, res);
			}
		})
	}
	
	else if (msg.request === "checkIn" && msg.checkpointId && msg.guardId) {
		var data = {
				guardId : msg.guardId,
				checkinId : msg.checkpointId,
			disposition : msg.description,
//			checkinTime : new Date(),
			slotId : 1
		};
		var checkinDate=msg.checkinDate;
//		Insert into dailyaudit (guardId, checkinId, disposition, slotId) values (4,1,'just for tsting', 1);
		console.log('Saving checkin details submtted by guard id '+msg.guardId+' checkIn details.');
		console.log('Detailes to be saved are : '+JSON.stringify(data));
		var connection = mysql.getConnection();
		var query = connection
				.query("Insert into dailyaudit (guardId, checkinId, disposition, slotId,checkinTime) values (?,?,?,?,?)", [msg.guardId, msg.checkpointId,msg.description, 1,checkinDate], function(error, rows){
					if(error){
						res.status = 'Failed';
						console.log(error);
						callback(null, res);
					} else {
						res.status = 'Success';
						console.log(JSON.stringify(rows));
						callback(null, res);
					}
				});
//		query("INSERT INTO dailyaudit VALUES", data).then(function(rows) {
//			res.status = 'Success';
//			callback(null, res);
//		}, function(error) {
//			res.status = 'Failed'
//			callback(null, res);
//		})
	}
	else if(msg.url === "searchGuard") {
		 var firstName=null; var buildingName=null;var email=null;var SSN=null;var lastName=null;
		 var startDate1=null;var endDate1=null;var backgroundStatus=null;var startDate2=null;var endDate2=null;
		if(msg.firstName!==undefined){
		  firstName=msg.firstName;}
		if(msg.lastName!==undefined){
			  lastName=msg.lastName;}
		if(msg.buildingName!==undefined){
		   buildingName=msg.buildingName;}
		if(msg.email!==undefined){
		   email=msg.email;}
		if(msg.SSN!==undefined){
		   SSN=msg.SSN;}
		if(msg.startDate1!==undefined){
		   startDate1=msg.startDate1;}
		if(msg.endDate1!==undefined){
		  endDate1=msg.endDate1;}
		if(msg.startDate2!==undefined){
			   startDate2=msg.startDate2;}
			if(msg.endDate2!==undefined){
			  endDate2=msg.endDate2;}
		if(msg.backgroundStatus!==undefined){
		  backgroundStatus=msg.backgroundStatus;}
		
		  console.log(firstName+""+buildingName+""+email+" "+SSN+""+startDate1+" "+endDate1+""+startDate2+""+backgroundStatus);
		  var userData=[firstName,lastName,email,buildingName,SSN,backgroundStatus];
		  var query1="select distinct g.guardId , concat(ud.firstName,' ',ud.lastName) as firstName" +
			" from user u , userdetails ud , building b, guard g," +
			" checkinpoints c where g.guardId=u.userId and u.userId=ud.userId " +
			" and u.deleteFlag='N'";
		  
		  
		  for(var i=0;i<userData.length;i++){
			 if(userData[i]!==null){
			  switch(i){
			  case 0: query1+=" and UPPER(ud.firstName) like UPPER('%"+userData[0]+"%')";	break;
			  case 1: query1+=" and UPPER(ud.lastName) like UPPER('%"+userData[1]+"%')";	break;
			  case 2: query1+=" and u.email like UPPER('%"+userData[2]+"%')";	break;
			  case 3: query1+=" and b.deleteFlag='N' and b.buildingId=c.buildingId and c.guard=g.guardId and b.buildingName like UPPER('%"+userData[3]+"%')";	break;
			  case 4: query1+=" and ud.userSSN like UPPER('%"+userData[4]+"%')";	break;
			  case 5: query1+=" and g.backgroundStatus='"+userData[5]+"'";	break;
			  }
			 }
		  }
		  
		  if(startDate1!==null && startDate1!='' &&  startDate2!==null&& startDate2!=''){
			  console.log("Inside Dates1");
			  query1+=" and g.startDate>='"+startDate1+"'and g.startDate<='"+startDate2+"'";}
			if(endDate2!==null && endDate1!==null && endDate2!=='' && endDate1!==''){
				  console.log("Inside Dates2");
			  query1+=" and g.endDate >='"+endDate1+"'and g.endDate <='"+endDate2+"'";
		  }
		  
		  
		  console.log(query1);
		  var connection = mysql.getConnection();
			/*************************************************************************/
			var query = connection.query(query1,function(err, rows){	 			
				if(err){
					console.log(err);
					throw err;
					//res.error=err;
				}
				else if(rows.length>0){	 	
					console.log("HI1");
							for(var i=0;i<rows.length;i++){
							console.log(rows[i].firstName+"and");
							}
							res.guards=rows;
								/*********************************************************************/
							callback(null, res);																					
					}
				else{
					callback(null, res);
				}
				/************** End Connection******************************************/	
				connection.end();	
				});
			}
	
	
	else if(msg.url==="getBuildingsByGuards"){
		var guardId=msg.guardId;
		console.log("Inside get Buildins");
		  var connection = mysql.getConnection();
		var query2=connection.query("select distinct c.buildingId,b.buildingName from checkinpoints c ," +
				"building b where guard=? and c.buildingId=b.buildingId",guardId,function(err, rows2){
			if(err){
				console.log(err);
				res.error=err;	
			}
			else{
				if (rows2.length>0) {
					res = rows2;
					console.log(JSON.stringify(rows2));
					callback(null, res);
				}
				else {
					res = {"code":401,"description":"No Details To Display"};
					callback(null, res);
				}
			}
			
		});					
		
	}
	/***********************************************************************************************************************************************************/
	
}
	/***********************************************************************************************************************************************************/
		
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
	query(
			'SELECT buildingId, buildingName, bLatitude, bLongitude, street FROM building where buildingId IN (SELECT DISTINCT buildingId FROM checkinpoints WHERE guard = ?',
			4).then(console.log, console.error);
};


exports.handle_request = handle_request;
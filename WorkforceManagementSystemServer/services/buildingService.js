var mysql = require('./mysql');

function handle_request(msg, callback){
	
	var res = {};
	/*************************************************************Search Building by name******************************************************************************/	
	if(msg.url==="searchBuildingByName"){

		var searchString = msg.searchString;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("select * from building where UPPER(buildingName) like UPPER(?)", ["%" + searchString + "%"], function(err, rows){	 			
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
			}
			else if(rows.length>0){	 				
						res.rows = rows;						
						/************** End Connection******************************************/	
						connection.end();		
						/*********************************************************************/
						callback(null, res);																					
				}				
			else{
				res.error="No matches found!";
				callback(null, res);	
			}
		});
	}
	/***********************************************************************************************************************************************************/
	
	/*************************************************************Get Checkpoints by Building******************************************************************************/	
	else if(msg.url==="getCheckpointsByBuilding"){

		var buildingId = msg.buildingId;
		var checkpointsExist = false;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("select c.checkinId, c.latitude, c.longitude, c.cName, ud.userId as guardId, concat(ud.firstName, ' ', ud.LastName) as guardName from checkinpoints c, userdetails ud where c.buildingId = ? and c.deleteFlag = 'N' and c.guard = ud.userId", buildingId, function(err, rows){
			res.rows = [];
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
				callback(null, res);
			}
			else {
				if(rows.length>0){
					res.rows = rows;
					checkpointsExist = true;
					}								
					var query = connection.query("select checkinId, latitude, longitude, cName from checkinpoints where buildingId = ? and isnull(guard) and deleteFlag = 'N'", buildingId, function(err, noGuardrows){	 			
						if(err){
							console.log(err);
							res.error="Something went wrong. Please try again!";								
						}
						else
							{
							if(noGuardrows.length>0){	
								checkpointsExist = true;
								for(var i=0; i<noGuardrows.length; i++)
								{
									res.rows.push({
										checkinId : noGuardrows[i].checkinId,
										latitude : noGuardrows[i].latitude,
										longitude : noGuardrows[i].longitude,
										cName : noGuardrows[i].cName
									});
								}	
								console.log(JSON.stringify(res.rows));
							}
							if(checkpointsExist == false){
								res.error="No checkpoints found for the selected building!";	
								callback(null, res);
							}					
							else
							{
								callback(null,res);
							}
						}												
				});
			}				
		});
	}
	/***********************************************************************************************************************************************************/
	
	
	/*************************************************************Update Checkpoint Guard******************************************************************************/	
	else if(msg.url==="updateCheckpointGuard"){

		var originalData = msg.originalData;
		var updatedData = msg.updatedData;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		console.log("originalData.length="+originalData.length);
		
		for( i=0 ; i<originalData.length; i++)
		{
			console.log("originalData[i].guardId:"+originalData[i].guardId+" originalData[i].checkinId:"+originalData[i].checkinId);
			console.log("updatedData[i].guardId:"+updatedData[i].selectedGuardId);
			if (originalData[i].guardId != updatedData[i].selectedGuardId)
			{
				
				var query = connection.query("update checkinpoints set guard = ? where checkinId = ?", [updatedData[i].selectedGuardId, originalData[i].checkinId], function(err, rows){					
					if(err){
						console.log(err);
						res.error="Something went wrong. Please try again!";	
					}
					else{	 				
						res.Status = "Success";												
						callback(null, res);																					
						}									
				});
			}
		}
		/************** End Connection******************************************/	
		connection.end();
		/*********************************************************************/		
	}
	/***********************************************************************************************************************************************************/
	
	/*************************************************************Unassign guard from checkpoint******************************************************************************/	
	else if(msg.url==="unassignGuard"){

		var checkinId = msg.checkinId;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("update checkinpoints set guard = NULL where checkinId = ?", checkinId, function(err, rows){	 			
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
			}
			else{	 
				console.log(JSON.stringify(rows));
				res.Status = "Success";												
				callback(null, res);																					
				}	
		});
	}
	/***********************************************************************************************************************************************************/

	/*************************************************************displayBuilding and dashboard*****************************************/

	else if(msg.url === "deleteBuilding") {
		var buildingId = msg.buildingId;
		var connection = mysql.getConnection();
		var query1 = connection.query("select c.guard from building b, checkinpoints c where b.buildingId = c.buildingId and b.buildingId = ? and c.deleteFlag = 'N' and b.deleteFlag = 'N' and c.guard is not null", [buildingId], function(err, results1) {
			connection.end();
			if(err){
				throw err;
			}
			else 
			{
				if(results1.length > 0) {
					res = {"code":401};
					callback(null, res);
				}
				else {
					connection = mysql.getConnection();
					var query2 = connection.query("update building set deleteFlag = 'Y' where buildingId = ?", [buildingId], function(err, results2) {
						connection.end();
						if(err) {
							throw err;
						}
						else {
							if(results2.affectedRows === 1) {
								res = {"code":200};
								callback(null, res);
							}
							else {
								console.log("Something went wrong with the update query. Affected Rows = " +results2.affectedRows);
								res = {"code":200}; //sending 200 because update was successful
								callback(null, res);
							}
						}
					});
				}
			}
		});
	}
	else if(msg.url === "deleteCP") {
		var checkinId = msg.checkinId;
		var connection = mysql.getConnection();
		var query1 = connection.query("select guard from checkinpoints where deleteFlag = 'N' and checkinId = ? and guard is not null", [checkinId], function(err, results1) {
			connection.end();
			if(err){
				throw err;
			}
			else 
			{
				if(results1.length > 0) {
					res = {"code":401};
					callback(null, res);
				}
				else {
					connection = mysql.getConnection();
					var query2 = connection.query("update checkinpoints set deleteFlag = 'Y' where checkinId = ?", [checkinId], function(err, results2) {
						connection.end();
						if(err) {
							throw err;
						}
						else {
							if(results2.affectedRows === 1) {
								res = {"code":200};
								callback(null, res);
							}
							else {
								console.log("Something went wrong with the update query. Affected Rows = " +results2.affectedRows);
								res = {"code":200}; //sending 200 because update was successful
								callback(null, res);
							}
						}
					});
				}
			}
		});
	}
	else if(msg.url === "createCP") {
		var buildingId = msg.buildingId;
		var latitude = msg.latitude;
		var longitude = msg.longitude;
		var cName = msg.cName;
		var data = {latitude:latitude, longitude:longitude, buildingId:buildingId, deleteFlag:"N", cName:cName};
		var connection = mysql.getConnection();
		var query = connection.query("INSERT INTO checkinpoints set ?", data, function(err, results) {
			connection.end();
			if(err){
				throw err;
			}
			else 
			{
				if(results.affectedRows === 1) {
					res = {"code":200,"results":results.insertId};
					callback(null, res);
				}
				else {
					res = {"code":401};
					callback(null, res);
				}
			}
		});
	}
	else if(msg.url === "updateCP") {
		var cName = msg.cName;
		var checkinId = msg.checkinId;
		var data = {cName:cName,checkinId:checkinId};
		var connection = mysql.getConnection();
		var query = connection.query("update checkinpoints set cName = ? where checkinId = ?", [cName,checkinId], function(err, results) {
			connection.end();
			if(err){
				throw err;
			}
			else 
			{
				if(results.affectedRows === 1) {
					res = {"code":200};
					callback(null, res);
				}
				else {
					res = {"code":401};
					callback(null, res);
				}
			}
		});
	}
	else if(msg.url === "updateBuilding") {
		var bDetails = msg.bDetails;
		var buildingId = msg.buildingId;
		var connection = mysql.getConnection();
		var query = connection.query("update building set ? where buildingId = ?", [bDetails,buildingId], function(err, results) {
			connection.end();
			if(err){
				throw err;
			}
			else 
			{
				if(results.affectedRows === 1) {
					res = {"code":200};
					callback(null, res);
				}
				else {
					res = {"code":401};
					callback(null, res);
				}
			}
		});
	}
	else if(msg.url === "buildingDetails") {
		var buildingId = msg.buildingId;
		var connection = mysql.getConnection();
		var query = connection.query("select b.street, DATE_FORMAT(b.releaseDate,'%Y-%m-%d') as releaseDate, b.city, b.state, b.zipCode, b.fixedAmount, b.bLatitude, b.bLongitude, b.buildingName, c.checkinId, c.latitude, c.longitude, c.cName from building b, checkinpoints c where b.buildingId = c.buildingId and b.buildingId = ? and b.deleteFlag = 'N' and c.deleteFlag = 'N'", [buildingId], function(err, results) {
			connection.end();
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0) {
					res = {"code":200,"results":results};
					callback(null, res);
				}
				else {
					res = {"code":401};
					callback(null, res);
				}
			}
		});
	}
	else if(msg.url === "dashboardMap") {
		var userId = msg.userId;
		var roleId = msg.roleId;
		var exitBool = false;
		var bQuery, cQuery, gQuery;
		console.log(roleId);
		if (roleId === 1) {
			bQuery = "SELECT b.buildingName, b.bLatitude, b.bLongitude FROM building b, user u where b.deleteFlag = 'N' and b.clientId = u.userId and u.deleteFlag = 'N'";
			cQuery = "select distinct c.cName, c.latitude, c.longitude from checkinpoints c, building b, user u where c.buildingId = b.buildingId and c.deleteFlag = 'N' and b.deleteFlag = 'N' and b.clientId = u.userId and u.deleteFlag = 'N'";
			gQuery = "select concat(ud.firstName,' ',ud.lastName) as guardName, c.latitude, c.longitude, date_format(max(d1.checkinTime),'%Y-%m-%d %h:%i %p') as lastCheckinTime from dailyaudit d1, userdetails ud, checkinpoints c, user u where d1.checkinId = c.checkinId and d1.guardId = ud.userId and ud.userId = u.userID and u.deleteFlag = 'N' group by d1.guardId";
		}
		else if(roleId === 2) {
			bQuery = "select distinct buildingName, bLatitude, bLongitude FROM building where deleteFlag = 'N' and clientId = '" +userId +"'";
			cQuery = "select distinct c.cName, c.latitude, c.longitude from checkinpoints c, building b where c.buildingId = b.buildingId and c.deleteFlag = 'N' and b.deleteFlag = 'N' and b.clientId = '" +userId +"'";
			gQuery = "select concat(ud.firstName,' ',ud.lastName) as guardName, c.latitude, c.longitude, date_format(max(d1.checkinTime),'%Y-%m-%d %h:%i %p') as lastCheckinTime from dailyaudit d1, userdetails ud, checkinpoints c, user u, building b where d1.checkinId = c.checkinId and d1.guardId = ud.userId and ud.userId = u.userID and u.deleteFlag = 'N' and c.buildingId = b.buildingId and b.clientID = '" +userId +"' group by d1.guardId";
		}
		else if(roleId === 3) {
			bQuery = "select distinct b.buildingName, b.bLatitude, b.bLongitude FROM building b, checkinpoints c, user u where b.deleteFlag = 'N' and c.deleteFlag = 'N' and b.clientId = u.userId and u.deleteFlag = 'N' and c.guard = '" +userId +"' and b.buildingId = c.buildingId";
			cQuery = "select distinct c.cName, c.latitude, c.longitude from checkinpoints c, building b, user u where c.buildingId = b.buildingId and c.deleteFlag = 'N' and b.deleteFlag = 'N' and b.clientId = u.userId and u.deleteFlag = 'N' and c.guard = '" +userId +"'";
			gQuery = "select concat(ud.firstName,' ',ud.lastName) as guardName, c.latitude, c.longitude, date_format(max(d1.checkinTime),'%Y-%m-%d %h:%i %p') as lastCheckinTime from dailyaudit d1, userdetails ud, checkinpoints c, user u where d1.checkinId = c.checkinId and d1.guardId = ud.userId and ud.userId = u.userID and u.deleteFlag = 'N' and d1.guardID = '" +userId +"' group by d1.guardId";
		}
		else {
			console.log("Invalid User Role");
			exitBool = true;
		}
		
		if(exitBool) {
			res = {"code":401};
			callback(null, res);
		}
		else {
			var connection;
			connection = mysql.getConnection();
			var query1 = connection.query(bQuery, function(err, bJson) {
				connection.end();
				if(err) { throw err; }
				else {
					if(bJson.length > 0) {
						connection = mysql.getConnection();
						var query2 = connection.query(cQuery, function(err, cJson) {
							connection.end();
							if(err) { throw err; }
							else {
								if(cJson.length > 0) {
									connection = mysql.getConnection();
									var query3 = connection.query(gQuery, function(err, gJson) {
										connection.end();
										if(err) { throw err; }
										else {
											if(gJson.length > 0) {
												res = {"code":200,"bJson":bJson,"cJson":cJson,"gJson":gJson};
												callback(null, res);
											}
											else {
												res = {"code":200,"bJson":bJson,"cJson":cJson,"gJson":gJson};
												callback(null, res);
											}
										}
									});
								}
								else {
									res = {"code":200,"bJson":bJson,"cJson":cJson,"gJson":{}};
									callback(null, res);
								}
							}
						});
					}
					else {
						res = {"code":401};
						callback(null, res);
					}
				}
			});
		}
	}
	else if(msg.url === "createBuilding") {
		var bDetails = msg.bDetails;
		var clientId = msg.clientId;
		var connection = mysql.getConnection();
		var query1 = connection.query("select b.buildingId from building b, user u where b.clientId = u.userId and u.deleteFlag = 'N' and b.deleteFlag = 'N' and b.bLatitude = ? and b.bLongitude = ?", [bDetails.bLatitude, bDetails.bLongitude], function(err, results) {
			connection.end();
			if(err) {
				throw err;
			}
			else {
				if(results.length === 0) {
					connection = mysql.getConnection();
					var query2 = connection.query("INSERT INTO building set ?", bDetails, function(err, results) {
						connection.end();
						if(err) {
							throw err;
						}
						else {
							if(results.affectedRows === 1) {
								res = {"code":200,"buildingId":results.insertId,"bLatitude":bDetails.bLatitude,"bLongitude":bDetails.bLongitude,"buildingName":bDetails.buildingName};
								callback(null, res);
							}
							else {
								res = {"code":401};
								callback(null, res);
							}
						}
					});
				}
				else {
					res = {"code":401};
					callback(null, res);
				}
			}
		});
	}
	else {
		console.log("url not defined");
		res = {"code":401};
		callback(null, res);
	}
	
}
	
exports.handle_request = handle_request;
var mysql = require('./mysql');
var mysqlConn = require('./mysql_connpool')
var redis = require("redis");
var bcrypt = require('./bCrypt');

/*
 * To Encrypt Password with Salt * 
 * 
 * */
function encryptPassword(pwd)
{
	//var bcrypt = require('bcryptjs');
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(pwd, salt);	
	return hash;
}

function handle_request(msg, callback){
	console.log("handlerequest");
	var res = {};
	/*************************************************************Search Client by name******************************************************************************/	
	if(msg.url==="searchClientByName"){
		console.log("url match");

		var searchString = msg.searchString;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("select c.clientId, concat(ud.firstName, ' ', ud.lastName) as clientName from userdetails ud, user u, client c where ud.userId = c.clientId and u.userId = ud.userId and u.deleteFlag = 'N' and (UPPER(ud.firstName) like UPPER(?) or UPPER(ud.lastName) like UPPER(?))", ["%" + searchString + "%", "%" + searchString + "%"], function(err, rows){	 			
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
	else if(msg.request === 'getBuldingAndAlertsDetails'){
		res={};
		var connection = mysql.getConnection();
		// console.log('Got request for getClientBuildings with client id: ');
		var query = connection.query('select b.buildingId buuldingId, b.buildingName buildingName,b.street street,b.city city,b.state state, bb.alerts alerts from building b join (SELECT  buildingId, count(*) alerts FROM alerts GROUP BY buildingId) as bb on  b.buildingId=bb.buildingId',[], function(error,rows){
			if (error) {
				console.log(error);
				res.error = error;
				res.status = 'Failed';
				callback(null,res);
			} else {
				console.log('getBuldingAndAlertsDetails are: '+JSON.stringify(rows));
				res.rows = rows;
				res.status = 'Success';
				callback(null,res);
			}
		});
	}

	
	/*************************************************************Get all clients******************************************************************************/	
	else if(msg.url==="getAllClients"){
		console.log("url match");
		
		/************** Create Connection******************************************/
		
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("select c.clientId, concat(ud.firstName, ' ', ud.lastName) as clientName from userdetails ud, user u, client c where ud.userId = c.clientId and u.userId = ud.userId and u.deleteFlag = 'N'", [], function(err, rows){	 			
			if(err){
				console.log(err);
				res.error="Something went wrong. Please try again!";	
				callback(null, res);
			}
			else if(rows.length>0){	 				
						res.rows = rows;						
						/************** End Connection******************************************/	
						//connection.end();		
						/*********************************************************************/
						callback(null, res);																					
				}				
			else{
				res.error="No clients found!";
				callback(null, res);	
			}
		});
		
	}
	
	else if(msg.request === 'getClientAndGuardDetails'){
		res={};
		var connection = mysql.getConnection();
		// console.log('Got request for getClientBuildings with client id: ';
		var query = connection.query('select b.clientId clientId, count(distinct c.guard) noOfGuards from checkinpoints c join building b on b.buildingId = c.buildingId group by b.clientId ',[], function(error,rows){
			if (error) {
				console.log(error);
				res.error = error;
				res.status = 'Failed';
				callback(null,res);
			} else {
				console.log('getClientAndGuardDetails are: '+JSON.stringify(rows));
				res.rows = rows;
				res.status = 'Success';
				callback(null,res);
			}
		});
	}

	/**
	 * Create Client..
	 */
	else if (msg.request === "createClient") {
		// var encpassword=encryptPassword(msg.password);
		var user = {
			"userId" : null,
			"email" : msg.email,
			"password" : encryptPassword(msg.password),
			"roleId" : msg.roleId,
			"deleteFlag" : "N"
		};
		var userDetails = {
			"firstName" : msg.firstName,
			"lastName" : msg.lastName,
			"street" : msg.street,
			"city" : msg.city,
			"state" : msg.state,
			"zipCode" : msg.zipCode,
			"phoneNumber" : msg.phoneNumber,
			"userSSN" : msg.userSSN,
		};
		var client = {
			"startDate" : msg.startDate,
			"endDate" : msg.endDate,
			"serviceFee" : msg.serviceFee,
		};
		var email = user.email;

		console.log("In RMQServer:Client Service for create client");
		console.log(user);
		var connection = mysql.getConnection();

		// var connection = mysql.getConnection();
		var query = connection
				.query(
						"select * from user where email=?",
						[ email ],
						function(err, rows) {
							console.log(rows);
							if (err || rows.length > 0) {
								console.log("In Err");
								// console.log(err);
								res.error = "User Already Existst!!";
								callback(null, res);
							}// Check DB Error for select on User table
							else {
								console.log("In Else");

								var query = connection
										.query(
												"INSERT INTO USER SET ? ",
												user,
												function(err, rows) {

													if (err) {
														console.log(err);
														res.error = "Something is wrong. Please try again.";
														callback(null, res);
													}// Check DB Error for
													// Insert on User
													else {
														console
																.log("Rows:"
																		+ rows.insertId);
														console
																.log(JSON
																		.stringify(rows));
														console
																.log(userDetails);
														userDetails.userId = rows.insertId;
														console
																.log(userDetails.userId);
														console
																.log(userDetails);

														var query = connection
																.query(
																		"INSERT INTO USERDETAILS SET ? ",
																		userDetails,
																		function(
																				err,
																				rows) {

																			if (err) {
																				console
																						.log(err);
																				res.error = "Something is wrong. Please try again.";
																				callback(null, res);
																			}// Check
																			// DB
																			// Error
																			// for
																			// Insert
																			// on
																			// Userdetails
																			else {
																				client.clientId = userDetails.userId;
																				console
																						.log(client);
																				var query = connection
																						.query(
																								"INSERT INTO CLIENT SET ? ",
																								client,
																								function(
																										err,
																										rows) {
																									if (err) {
																										console
																												.log(err);
																										res.error = "Something is wrong. Please try again.";
																										callback(null, res);
																									}// Check
																									// DB
																									// Error
																									// for
																									// Insert
																									// on
																									// Client
																									else {
																										res.code = '200';
																										res.clientId = userDetails.userId;
																										res.status = 'Success';
																										console.log('Client created succesfully with user id :'+userDetails.userId);
																										callback(null, res);
																									}// Else-Check
																									// DB
																									// Error
																									// for
																									// Insert
																									// on
																									// Client
																								});// Insert
																				// Query
																				// on
																				// Client
																			}// Else-Check
																			// DB
																			// Error
																			// for
																			// Insert
																			// on
																			// User
																		});// Insert
														// Query
														// on
														// Userdetails
													}// Else- //Check DB
													// Error for Insert on
													// User
												});// Insert Query on User
							}// Else-Check DB Error for select on User table

							
						});// select query on user

	} 
	
	/*************************************************************Get Client******************************************************************************/
	else if (msg.url === "getClient") {
		console.log("in getClient" + msg.clientId);
		var connection = mysql.getConnection();
		var query = connection
				.query(
						"SELECT ud.firstName, ud.street, ud.city, ud.zipcode, ud.state, ud.phoneNumber, ud.lastName, c.serviceFee, u.email, ud.userSSN, DATE_FORMAT(c.startDate,'%Y-%m-%d') as startDate, DATE_FORMAT(c.endDate,'%Y-%m-%d') as endDate FROM user u  join userdetails ud on u.userId = ud.userId join client c on c.clientId = ud.userId where ud.userId=?",
						[ msg.clientId ], function(err, rows) {
							console.log("in getClient after query " + rows);
							if (err) {
								console.log(err);
								res.error = err;
								res.status = 'Failed';
							} else if (rows.length > 0) {
								res.profile = rows[0];
								console.log(res.profile);
								res.status = 'Success';
//								connection.end();
								// callback(null, res);
							} else {
								res.error = "Invalid client id";

							}
							callback(null, res);
						});
	} 
	else if(msg.request ==='getClientBuildings'){
		res={};
		var connection = mysql.getConnection();
		console.log('Got request for getClientBuildings with client id: '+msg.clientId);
		var query = connection.query('select * from building where clientId=?',[msg.clientId], function(error,rows){
			if (error) {
				console.log(error);
				res.error = error;
				res.status = 'Failed';
				callback(null,res);
			} else {
				console.log('Client buildings are: '+JSON.stringify(rows));
				res.buildings = rows;
				res.status = 'Success';
				callback(null,res);
			}
		});
	}
	
	/*************************************************************Update client******************************************************************************/
	else if (msg.url === 'updateClient') {
		// console.log("in getClient" + msg.clientId);
		// var clietDetails = msg.param('updateClient');
		var connection = mysql.getConnection();
		var query = connection.query("UPDATE USERDETAILS SET ? where userId=?",
				[ {
					firstName : msg.firstName,
					lastName : msg.lastName,
					street : msg.street,
					city : msg.city,
					state : msg.state,
					zipcode : msg.zipCode,
					userSSN : msg.ssn,
					phoneNumber : msg.phone
				}, msg.userId ], function(err, rows) {
					if (err) {
						console.log(err);
						res.status = 'Failed';
						res.error = err;
					} else if (rows.affectedRows > 0) {
						res.update = "Success";
						console.log(JSON.stringify(rows));
						res.status = 'Success';
//						connection.end();
					} else {
						console.log(rows.toString() + " for client id "
								+ msg.userId);
						res.error = "Invalid client id";
						res.status = 'Failed';

					}
					callback(null, res);
				});

	}
	
	/*************************************************************Delete client******************************************************************************/
	else if (msg.url === 'deleteClient') {
		var connection = mysql.getConnection();
		var query = connection.query("UPDATE USER SET ? WHERE userId = ?", [ {
			deleteFlag : 'Y'
		}, msg.clientId ], function(err, rows) {
			if (err) {
				console.log(JSON.stringify(err));
				res.status = 'Failed';
				res.error = err;
			} else if (rows.affectedRows === 0) {
				res.error = 'No client with given id exists';
				res.status = 'Failed';
			} else {
				res.status = 'Success';
			}
			callback(null, res);
		})
	} else {
		console.log('Invalid Request..'+JSON.strigify(msg));
		res.status="Failed";
		res.error = "Invalid requet";
		callback(null,res);
	}
}
	/***********************************************************************************************************************************************************/

exports.handle_request = handle_request;
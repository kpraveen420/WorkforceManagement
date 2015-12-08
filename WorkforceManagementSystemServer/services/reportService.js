var mysql = require('./mysql');

function handle_request(msg, callback) {
	
	var res={};
	var query;
	
	if(msg.url === "clientcriteria") {
		query = "select firstName, lastName, userId from userdetails where userId in(select clientId from client)";
		mysql.fetchData(function(err,results){
			if(err){
				console.log("err");
				callback(err,null);
			}
			else 
			{
				console.log(JSON.stringify(results));
				if(results.length > 0) {
					console.log("Valid client criteria");
					callback(null, results);
				}
				else {
					console.log("InValid client criteria");
					result = {"status":"fail"};
					callback(null, result);
				}
			}  
		},query);
	}
	
	else if(msg.url === "buildingcriteria") {
		console.log(msg.clientId);
		var clientId = msg.clientId;
		
		query = "select buildingName, buildingId, clientId from building where clientId="+clientId;
		mysql.fetchData(function(err,results){
			if(err){
				console.log("err");
				callback(err,null);
			}
			else 
			{
				console.log(JSON.stringify(results));
				if(results.length > 0) {
					console.log("Valid building criteria");
					callback(null, results);
				}
				else {
					console.log("InValid building criteria");
					result = {"status":"fail"};
					callback(null, result);
				}
			}  
		},query);
	}
	
	else if(msg.url === "searchreports") {
		var reportFromdate = msg.reportFromdate;
		var reportTodate = msg.reportTodate;
		
		if(msg.clientId === undefined)
		{var clientId = null;}
	else{ var clientId = msg.clientId;}
	
	if(msg.buildingId === undefined)
	{var buildingId = null;}
else{ var buildingId = msg.buildingId;}
	
	if(msg.reportFromdate === undefined)
	{var reportFromdate = null;}
else{ var reportFromdate = msg.reportFromdate;}
	
	if(msg.reportTodate === undefined)
	{var reportTodate = null;}
else{ var reportTodate = msg.reportTodate;}
	
		console.log(clientId);
		console.log(buildingId);
		console.log(reportFromdate);
		console.log(reportTodate);
		
		//query = "select * from reports r JOIN building b on r.buildingId=b.buildingId where " +
			//	"r.buildingId="+buildingId+" or b.clientId="+clientId+" or r.creationTime between '"+reportFromdate+"' and '"+reportTodate+"'";
		//query = "select * from reports where buildingId="+buildingId+" or buildingId in(select buildingId from Building where clientId="+clientId+")";
		
		query = "select r.reportId, r.buildingId, DATE_FORMAT(r.creationTime,'%Y-%m-%d') as creationTime, b.clientId, b.buildingName, ud.firstName, ud.lastName  from reports r, building b, client c, userdetails ud where r.buildingId=b.buildingId and b.clientId=c.clientId and c.clientId=ud.userId";
		
		var userData = [clientId,buildingId];
		
		for(var i=0;i<userData.length;i++){
			 if(userData[i]!==null){
			  switch(i){
			  case 0: query+=" and b.clientId="+userData[0];	break;
			  case 1: query+=" and r.buildingId ="+userData[1];	break;

			  }
			 }
		  }
		
		if(reportFromdate !== undefined && reportFromdate!==null && reportTodate !== undefined && reportTodate!==null)
		{
		query+=" and r.creationTime between '"+reportFromdate+"' and '"+reportTodate+"'";
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
					console.log("Valid search reports");
					callback(null, results);
				}
				else {
					console.log("InValid search reports");
					result = {"status":"fail"};
					callback(null, result);
				}
			}  
		},query);
	}
	
	else 	if(msg.url === "displayReport") {
		var createTime=msg.createTime;
		var buildingId=msg.buildingId;
		var reportIds=[];
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query1 = connection.query("select r.reportId,b.buildingName ,DATE_FORMAT(r.creationTime,'%Y-%m-%d') as creationTime,u.firstName,u.lastName " +
				"from reports r,userdetails u,building b where r.buildingId=b.buildingId and r.createdBy=u.userId " +
				" and r.buildingId=? and r.creationTime=?", [buildingId,createTime], function(err, rows1){	 			
			
			
			if(err){
				throw err;
			}
			else 
			{
				if(rows1.length > 0) {
					console.log(rows1.length+" "+rows1);
					for(var i=0;i<rows1.length;i++){
						reportIds[i]=rows1[i].reportId;
					}
					console.log(reportIds[0]);
					res.reportDetails=rows1;
					res.Rcode=200;
					
					var data="(";
					//console.log(reportIds.length);
					for(var j=0;j<reportIds.length;j++){
						//console.log(reportIds[j]);
						
						if(reportIds[j]!==undefined){
						data+=reportIds[j];
						
						if(j!=reportIds.length-1) {
							data+=",";
						}
					}
						
						}
					data+=")";
					console.log("array values"+data);
					var connection = mysql.getConnection();
						var query2 = connection.query("select m.maintenanceId,m.description from " +
								"maintenancecalls m where m.reportId in "+data,function(err, rows2){	 			
							if(err){
								throw err;
							}
							else 
							{
								if(rows2.length > 0) {
									console.log(rows2.length+" "+rows2);
									res.maintenance=rows2;
									res.Mcode=200;
									//callback(null, res);
									var connection = mysql.getConnection();
									var query3 = connection.query("select s.serviceId,s.description from " +
											"servicecalls s where s.reportId in "+data,function(err, rows3){	 			
										if(err){
											throw err;
										}
										else 
										{
											if(rows3.length > 0) {
												console.log(rows3.length+" "+rows3);
												res.servicecalls=rows3;
												res.Scode=200;
												//callback(null, res);
												var connection = mysql.getConnection();
												var query4 = connection.query("select i.incidentId,i.description,i.incidentTime from " +
														"incidents i where i.reportId in "+data,function(err, rows4){	 			
													if(err){
														throw err;
													}
													else 
													{
														if(rows4.length > 0) {
															console.log(rows4.length+" "+rows4);
															res.incidents=rows4;
															res.Icode=200;
															//callback(null, res);
															var connection = mysql.getConnection();
															var query5 = connection.query("select p.parkingLotNo,p.vehicleNumber,p.vehicleModel,DATE_FORMAT(p.reportedTime,'%Y-%m-%d') as reportedTime from " +
																	"parkingviolation p where p.reportId in "+data,function(err, rows5){	 			
																if(err){
																	throw err;
																}
																else 
																{
																	if(rows5.length > 0) {
																		console.log(rows5.length+" "+rows5);
																		res.parking=rows5;
																		res.Pcode=200;
																		var date1=rows1[0].creationTime;
																		var date3=new Date(date1);
																		var date2=new Date(date1);
																		date3.setHours(08,00,00,00);
																		date2.setHours(date3.getHours()-12);
																		console.log(createTime);
																		console.log(date2);
																		console.log(date3);
																		
																		//var arrayTemp=[date2.getFullYear(), date2.getMonth()+1, date2.getDate()+1]; // year, month (0-based), day
																		
																	//	date2=arrayTemp[0]+"-"+arrayTemp[1]+"-"+arrayTemp[2];
																		
																		//date1="'"+createTime+" 20:00:00'";
																		//date2="'"+date2+" 08:00:00'";
																		//console.log(date2+"and"+date1);
																		var connection = mysql.getConnection();
																		var query6 = connection.query("SELECT c.cName, DATE_FORMAT(d.checkinTime,'%Y-%m-%d') as checkinTime,d.disposition from checkinpoints c, dailyaudit d, " +
																				"building b  where b.buildingId=c.buildingId and c.checkinId=d.checkinId" +
																				"  and b.buildingId=? and d.checkinTime >=? and d.checkinTime <=? "
																				,[buildingId,date2,date3],function(err, rows6){	 		
																			
																			
																			if(err){
																				throw err;
																			}
																			else 
																			{
																				if(rows6.length>0) {
																					console.log(rows6.length+" "+rows6);
																					res.checkindata=rows6;
																					res.Ccode=200;
																					//callback(null, res);
																					
																				}
																				else {
																					console.log("Invalid Reports");
																					res.checkindata = {"code":401,"description":"No Details To Display"};
																					//callback(null, res);
																				}
																			}
																		});
																		//callback(null, res);
																	}
																	else {
																		console.log("Invalid Reports");
																		res.parking = {"code":401,"description":"No Details To Display"};
																		//callback(null, res);
																	}
																}
															});	
														}
														else {
															console.log("Invalid Reports");
															res.incidents = {"code":401,"description":"No Details To Display"};
															//callback(null, res);
														}
													}

									});	
												
											}
											else {
												console.log("Invalid Reports");
												res.servicecalls = {"code":401,"description":"No Details To Display"};
												//callback(null, res);
											}
										}
									});	
								}
								else {
									console.log("Invalid Reports");
									res.maintenance = {"code":401,"description":"No Details To Display"};
									//callback(null, res);
								}
							}
							});	
					//callback(null, res);
				}
				else {
					console.log("Invalid Reports");
					res.reportDetails = {"code":401,"createTime":createTime,"description":"No Details To Display"};
					//callback(null, res);
				}
			}  
			//connection.end();	

			callback(null,res);	
				
	});
		connection.end();
		connection.end();
		connection.end();
		connection.end();
		connection.end();
		
	}
	
else if(msg.url === "createReport"){
		
		console.log("hi")
		var description=msg.description;
		var buildingName=msg.buildingName;
		var violationType=msg.violationType;
		var parkingLotNo=msg.parkingLotNo;
		var vehicleNumber=msg.vehicleNo;
		var vehicleModel=msg.vehicleModel;
		var violationDate=msg.violationDate;
		var currentDate=new Date();
		
		currentDate=currentDate.getFullYear()+"-"+(currentDate.getMonth()+1)+"-"+currentDate.getDate();
		//var buildingId=msg.buildingId;
		
		var buildingId=2;
		
		console.log(currentDate);
		var reportId;
		//var guardId=session.userId;
		var guardId=4;
		var connection = mysql.getConnection();
		var query7=connection.query("select reportId from reports " +
				"where date(creationTime)=? and createdBy=? and buildingId=?",[currentDate,guardId,buildingId],function(err, rows1){
			
			if(err){
				console.log(err);
				res.error=err;	
			}
			
			if(rows1.length==0){
		// Inside data		console.log("In insert data");
				var connection = mysql.getConnection();
				console.log("after select if 0");
				var insertQuery= "insert into reports (buildingId,createdBy) values ("+buildingId+","+guardId+")";
				var query9=connection.query(insertQuery,function(err, rows2){
					if(err){
						console.log(err);
						res.error=err;	
					}
					else{
						console.log("Hello all");
						
						reportId=rows2.insertId;
						//reportId=1;//rows2[0].
						console.log(reportId);
						//console.log(JSON.stringify(rows5));
						console.log('before insertdata');
						insertdata();
					
							}
				});
				connection.end();
				
			}
			else{
				reportId=rows1[0].reportId;
				insertdata();
			}
		});
		
	function insertdata(){
	console.log('in insertdata');
		if(violationType.name=="Parking"){
			console.log("In Parking calls");
					//	var data1={parkingLotNo:parkingLotNo,vehicleNumber:vehicleNumber,vehicleModel:vehicleModel,
						//		 reportId:reportId};
						var query1="insert into parkingviolation (parkingLotNo,vehicleNumber,vehicleModel,reportId,reportedTime) " +
								"values ("+parkingLotNo+",'"+vehicleNumber+"','"+vehicleModel+"',"+reportId+",'"+violationDate+"')";
					console.log(query1);
						var query10=connection.query(query1,function(err, rows2){
						if(err){
							console.log(err);
							res.error=err;	
						}
						else{
							console.log("In Success");
							res.success="Inserted Successfully";
							res.code=200;
							callback(null, res);
						}
						
					});						
		}
		else if(violationType.name=="Incident"){
			console.log("In Incidents calls");
					//	var data2={description:description,reportId:reportId,incidentId:null,incidentTime:null};
						var incQuery="insert into incidents (description,reportId,incidentTime) values ('"+description+"',"+reportId+",'"+violationDate+"')";
						console.log(incQuery);
						var query11=connection.query(incQuery,function(err, rows2){
						if(err){
							console.log(err);
							res.error=err;	
						}
						else{
							console.log("In Success");
							res.success="Inserted Successfully";
							res.code=200;
							callback(null, res);
						}
					});								
		}
		else if(violationType.name=="Maintenance"){
			console.log("In maintenance calls");
					//	var data3={description:description,reportId:reportId};	
						var maintQuery="insert into maintenancecalls (description,reportId,createTime) values ('"+description+"',"+reportId+",'"+violationDate+"')";
					var query12=connection.query(maintQuery,function(err, rows2){
						if(err){
							console.log(err);
							res.error=err;	
						}
						else{
							console.log("In Success");
							res.success="Inserted Successfully";
							res.code=200;
							callback(null, res);
						}
					});						
		}
		else if(violationType.name=="Service"){
			console.log("In Service calls");
					//	var data4={reportId:reportId,description:description};
						var servQuery="insert into servicecalls (description,reportId,deliveryTime) values ('"+description+"',"+reportId+",'"+violationDate+"')";
					var query13=connection.query(servQuery,function(err, rows2){
						if(err){
							console.log(err);
							res.error=err;	
						}
						else{
							console.log("In Success");
							res.success="Inserted Successfully";
							res.code=200;
							callback(null, res);
						}
					});						
					}
		}	
	}
	else {
		console.log("Invalid URL");
		res = {"code":401};
		callback(null, res);
	}	
	
	
}

exports.handle_request = handle_request;


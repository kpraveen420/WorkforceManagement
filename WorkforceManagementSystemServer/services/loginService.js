var mysql = require('./mysql');
var bcrypt = require('./bCrypt');

function handle_request(msg, callback){
	
	var res = {};
	/*************************************************************Login Validation******************************************************************************/	
	if(msg.url==="login"){

		var email = msg.email, password = msg.password;
		/************** Create Connection******************************************/
		var connection = mysql.getConnection();
		/*************************************************************************/
		var query = connection.query("select * from user where email=? and deleteFlag='N'", [email], function(err, rows){	 			
			if(err){
				console.log(err);
				res.error="Something is wrong. Please try again later.";	
				callback(null, res);
			}
			else if(rows.length>0)
				{	
				if(rows[0].roleId === 1)
					{
					res.userId = rows[0].userId;
					res.roleId = rows[0].roleId;
					/************** End Connection******************************************/	
					connection.end();		
					/*********************************************************************/
					callback(null, res);
					}
				else if(bcrypt.compareSync(password, rows[0].password.toString()))
					{
						res.userId = rows[0].userId;
						res.roleId = rows[0].roleId;
						/************** End Connection******************************************/	
						connection.end();		
						/*********************************************************************/
						callback(null, res);
					}
					else
					{
						res.error="Invalid Credentials";
						callback(null, res);
					}
				}				
			else{
				res.error="Invalid User";
				callback(null, res);	
			}
		});
	}
	/***********************************************************************************************************************************************************/
}
	
exports.handle_request = handle_request;
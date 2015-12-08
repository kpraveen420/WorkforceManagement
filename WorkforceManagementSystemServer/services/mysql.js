var ejs= require('ejs');
var mysql = require('mysql');

function getConnection(){	
	var connection=mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'prash',
		database : 'workforce'
	});
	return connection;
}

exports.getConnection=getConnection;

exports.fetchData = function(callback, sqlQuery) {

	console.log("\nSQL Query::" + sqlQuery);

	var connection = getConnection();

	connection.query(sqlQuery, function(err, rows, fields) {

		if (err) {
			callback(err);
		} else { // return err or result
			console.log(rows);
			callback(err, rows);

		}
	});
	console.log("\nConnection closed..");
	connection.end();
}
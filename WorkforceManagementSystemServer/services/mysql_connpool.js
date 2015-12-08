var ejs= require('ejs');
var mysql = require('mysql');

var queue = require('queue');
var connPool = new queue();

function getDBConn()
{
	var dbConn;	
	if(getPoolSize() <= 0)
	{
		updateConnPool(100);
	}
	dbConn = getConnection();	
    return dbConn;
}

function returnDBconn(dbConn)
{	
	addConnection(dbConn);	
}

exports.fetchData = function(callback, sqlQuery) {

	console.log("\nSQL Query::" + sqlQuery);

	var connection = getDBConn();

	connection.query(sqlQuery, function(err, rows, fields) {

		if (err) {
			callback(err);
		} else { // return err or result

			callback(err, rows);

		}
	});
	console.log("\nConnection closed..");
	returnDBconn(connection);
}

function dbConnect()
{
	var dbCon = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		database: 'workforce'
	});

	dbCon.connect();

	return dbCon;
}

function addConnection(dbCon)
{
	if(connPool !== null)
	{
		connPool.push(dbCon);
	}
}

function getConnection()
{
	if(connPool.length >= 1)
	{
		connPool.reverse();
		var dbConn = connPool.pop();
		connPool.reverse();
		return dbConn;
	}
}

function initializeConnPool(poolSize)
{
	if(connPool !== null)
	{
		connPool.start();
		for(var cnt = 0; cnt < poolSize; cnt++)
		{
			addConnection(dbConnect());
		}
	}
}


function getPoolSize()
{
	if(connPool !== null)
	{
		return connPool.length;
	}
}

function updateConnPool(updateSize)
{
	if(connPool !== null)
	{
		for(var cnt = 0; cnt < updateSize; cnt++)
		{
			connPool.addConnection(dbConnect());
		}
	}
}

function terminateConnPool()
{
	if(connPool !== null)
	{
		connPool.stop();
	}
}

exports.initializeConnPool = initializeConnPool;
exports.addConnection = addConnection;
exports.getConnection = getConnection;
exports.terminateConnPool = terminateConnPool;
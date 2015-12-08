
exports.checkException = function(err, res) {
	
	if (err !== undefined || err.errno !== undefined) {
		if (err.errno === 1062) {
			// Unique key violations
			res.send({								
						'errmsg' : 'Unique Constraint failed..'
					});
		} else if (err.errno === 1452) {
			// for foreign key violations.
			res.send({
				'errmsg' : 'Invalid user id.'
			});
		} else if (err.errno === 1292) {
			// for Incorrect date value
			res.send({
				'errmsg' : 'Invalid Date. Please enter a valid date'
			});
		} else if (err.errno === 1366) {
			res.send({
				'errmsg' : 'User id should be an integer value.'
			});
		} else if (err.errno === 1451) {
			res.send({
				'errmsg' : 'Foreign key exception'
			});		
		} else if (err.errno === 1064) {
			console
					.log('errmsg in sql syntax. Please check the log for complete errmsg.');
			res
					.send({
						'errmsg' : 'Facing some technical issues. Please try again later.'
					});
		}

		else {
			res.send({
				'errmsg' : 'Something is wrong. Please check the data entered.'
			});
		}
	}
};

/**
 * Custom errmsg with the message passed
 */
exports.customException = function(msg, res) {
	if (msg !== undefined) {
		res.send({
			'errmsg' : msg
		});
	} else {
		res.send({
			'errmsg' : 'Something went wrong. Please try again'
		});
	}
}
'use strict';

var glob = require('glob');
var Promise = require('bluebird');

module.exports = function(pattern) {
	return new Promise(function(resolve, reject) {
		glob(pattern, function (err, files) {
			if(err) {
				return reject(err);
			}

			return resolve(files);
		});
	});
};

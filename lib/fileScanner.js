'use strict';

var glob = require('glob');
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function (globPattern, fileList) {
	// console.log("pattern = " + globPattern);
	// console.log("files = " + fileList);
	return new Promise(function (resolve, reject) {
		if (globPattern) {
			glob(globPattern, function (err, files) {
				if (err) {
					return reject(err);
				}

				var result = _.union(files, _.compact(fileList));

				return resolve(_.uniq(result));
			});
		} else {
			return resolve(fileList);
		}
	});
};

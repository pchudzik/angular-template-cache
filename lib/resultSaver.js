'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

module.exports = function resultSaverFactory(options) {
	return _.partial(resultSaver, options);
};

function resultSaver(options, result) {
	var resultFile = options.output;
	if (resultFile) {
		return fs.writeFileAsync(
			resultFile,
			result);
	} else {
		return new Promise(function(resolve) {
			process.stdout.write(result, resolve);
		});
	}
}

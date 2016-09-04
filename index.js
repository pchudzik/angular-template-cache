'use strict';

var fileScanner = require('./lib/fileScanner');
var fileProcessor = require('./lib/fileProcessor');
var templateGenerator = require('./lib/templateGenerator');
var resultSaver = require('./lib/resultSaver');

module.exports = function html2jsProcessor(options) {
	return fileScanner(options.files)
		.then(fileProcessor(options))
		.then(templateGenerator(options))
		.then(resultSaver(options));
};

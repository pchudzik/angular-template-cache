'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var htmlMinifier = require('html-minifier').minify;
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));

var optionsHelper = require('./optionsHelper');

module.exports = function entriesCollectorFactory(options) {
	return _.partial(processFiles, options);
};

function processFiles(options, files) {
	var processSingleFile = _.partial(processFile, options);
	return Promise
		.all(_.map(files, processSingleFile))
		.then(_.compact);
}

function processFile(options, file) {
	var quotmarkToUse = optionsHelper.selectQuote(options.quotmark);
	var fixQuotmark = _.partial(fixQuotationMark, quotmarkToUse);
	var fixLineEnd = _.partial(fixLineEndings, options.whitespace, quotmarkToUse);
	var convertToEntry = _.partial(createEntry, options.basePath, file);
	var wrapInQuote = _.partial(quote, quotmarkToUse);
	var minifyHtml = _.partial(executeHtmlMinification, options);

	return fs.readFileAsync(file)
		.then(trimString)
		.then(minifyHtml)
		.then(fixBackslash)
		.then(fixQuotmark)
		.then(fixLineEnd)
		.then(wrapInQuote)
		.then(convertToEntry)
		.catch(function (err) {
			if(!options.ignoreMissing) {
				return Promise.reject(err);
			}
		});
}

function executeHtmlMinification(options, html) {
	if(options.htmlmin) {
		return htmlMinifier(html, options.htmlminOptions);
	}
	return html;
}

function createEntry(basePath, file, fileContent) {
	var filePath = basePath.concat(file);
	return {
		path: filePath,
		html: fileContent
	};
}

function trimString(string) {
	return _.trim((string || ''));
}

function fixBackslash(string) {
	return string.replace(/\\/g, '\\\\');
}

function fixQuotationMark(quotmark, string) {
	return string.replace(new RegExp(quotmark, 'g'), '\\' + quotmark);
}

function quote(quotmark, string) {
	return quotmark + string + quotmark;
}

function fixLineEndings(whitespaceOption, quotmark, string) {
	var plus = '+';
	var space = ' ';
	var newline = '\n';
	var escapedNewline = '\\n';
	var whitespace = optionsHelper.selectWhitespace(whitespaceOption);
	return string.replace(
		/\r?\n/g,
		escapedNewline + quotmark + space + plus + newline + whitespace + whitespace + whitespace + quotmark);
}

'use strict';

var defaults = require('../lib/defaults');

var _ = require('lodash');

var td = require('testdouble');
var proxyquire = require('proxyquire');

var expect = require('chai').expect;

describe('fileProcessor.spec.js', function () {
	var readFileMock;
	var htmlMinifier;

	var fileProcessor;

	var anyFile = 'file1.html';
	var anyContent = 'any file content';

	beforeEach(function () {
		readFileMock = td.function();
		htmlMinifier = td.function();

		fileProcessor = proxyquire('../lib/fileProcessor', {
			fs: {readFile: readFileMock},
			'html-minifier': {minify: htmlMinifier}
		});
	});

	it('should configure base path for files', function (done) {
		//given
		var file = 'path/to/html/file.html';
		mockFsToReturnContent(file, anyContent);

		//when
		processFiles([file], {basePath: 'path/to/'})

		//then
			.then(function (entries) {
				expect(entries[0].path).to.eql('html/file.html');
			})
			.then(done);
	});

	it('should read all files content', function (done) {
		//given
		mockFsToReturnContent('file1.html', '<b>file1</b>');
		mockFsToReturnContent('file2.html', '<b>file2</b>');

		//when
		processFiles(['file1.html', 'file2.html'])

		//then
			.then(function (entries) {
				expect(entries).to.eql([
					{
						path: 'file1.html',
						html: '\'<b>file1</b>\''
					},
					{
						path: 'file2.html',
						html: '\'<b>file2</b>\''
					}
				]);
			})
			.then(done);
	});

	it('should process all files content', function (done) {
		//given
		mockFsToReturnContent('file1.html', '  file1  ');
		mockFsToReturnContent('file2.html', '  file2  ');

		//when
		processFiles(['file1.html', 'file2.html'])

		//then
			.then(function (entries) {
				expect(entries).to.eql([
					{
						path: 'file1.html',
						html: '\'file1\''
					},
					{
						path: 'file2.html',
						html: '\'file2\''
					}
				]);
			})
			.then(done);
	});

	describe('html-minify', function () {
		it('should pass all htmlminOptions options to htmlmin', function (done) {
			//given
			var htmlMinifierOptions = {
				otherOption: '123',
				htmlmin: true,
				htmlminOptions: {
					caseSensitive: false,
					minifyURLs: true,
					keepClosingSlash: true
				}
			};
			mockFsToReturnContent(anyFile, anyContent);
			td.when(htmlMinifier(), {ignoreExtraArgs: true}).thenReturn(anyContent);

			//when
			processFiles([anyFile], htmlMinifierOptions)

			//then
				.then(function () {
					td.verify(htmlMinifier(anyContent, {
						caseSensitive: false,
						minifyURLs: true,
						keepClosingSlash: true
					}));
				})
				.then(done);
		});

		[true, false].forEach(function (htmlminOn) {
			it('should minify html when htmlmin options is true', function (done) {
				//given
				mockFsToReturnContent(anyFile, anyContent);
				td.when(htmlMinifier(), {ignoreExtraArgs: true}).thenReturn(anyContent);

				//when
				processFiles([anyFile], {htmlmin: htmlminOn})

				//then
					.then(function () {
						td.verify(htmlMinifier(anyContent, td.matchers.anything()), {times: htmlminOn ? 1 : 0});
					})
					.then(done);
			});
		});
	});

	describe('html processing', function () {
		[
			{
				whitespace: 'spaces',
				rawHtml: '1\n2',
				fixedHtml: '\'1\\n\' +\n            \'2\''
			},
			{
				whitespace: 'tabs',
				rawHtml: '1\n2',
				fixedHtml: '\'1\\n\' +\n\t\t\t\'2\''
			}]
			.forEach(function (params) {
				it('should use requested whitespace type ' + params.whitespace, function (done) {
					//given
					mockFsToReturnContent(anyFile, params.rawHtml);

					//when
					processFiles([anyFile], {whitespace: params.whitespace})

					//then
						.then(function (entries) {
							expect(entries[0].html).to.eql(params.fixedHtml);
						})
						.then(done);
				});
			});

		[
			{
				description: 'should trim input',
				rawHtml: ' \n html  \n',
				fixedHtml: '\'html\''
			},
			{
				description: 'should fix line endings',
				rawHtml: 'line1\nline2',
				fixedHtml: '\'line1\\n\' +\n\t\t\t\'line2\''
			},
			{
				description: 'should fi backslash in html',
				rawHtml: 'C:\\users',
				fixedHtml: '\'C:\\\\users\''
			}
		].forEach(function (params) {
			it(params.description, function (done) {
				//given
				mockFsToReturnContent(anyFile, params.rawHtml);

				//when
				processFiles([anyFile])

				//then
					.then(function (entries) {
						expect(entries[0].html).to.eql(params.fixedHtml);
					})
					.then(done);
			});
		});

		[
			{
				quotmarkType: 'single',
				quotmark: '\'',
				rawHtml: '<i class=\'glyphicon\'></i>',
				fixedHtml: '\'<i class=\\\'glyphicon\\\'></i>\''
			},
			{
				quotmarkType: 'double',
				quotmark: '"',
				rawHtml: '<i class="glyphicon"></i>',
				fixedHtml: '"<i class=\\"glyphicon\\"></i>"'
			}
		].forEach(function (params) {
			it('should fix quotmark in html', function (done) {
				//given
				mockFsToReturnContent(anyFile, params.rawHtml);

				//when
				processFiles([anyFile], {quotmark: params.quotmarkType})

				//then
					.then(function (entries) {
						expect(entries[0].html).to.eql(params.fixedHtml);
					})
					.then(done);
			});
		});
	});

	function processFiles(files, options) {
		var initialHtmlMin = (options||{}).htmlmin;
		var optionsToUse = _.defaults(options || {}, defaults);
		optionsToUse.htmlmin = false || initialHtmlMin;
		return fileProcessor(optionsToUse)(files);
	}

	function mockFsToReturnContent(file, content) {
		td.when(readFileMock(file)).thenCallback(null, content);
	}
});

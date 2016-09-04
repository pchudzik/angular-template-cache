'use strict';

var defaults = require('../lib/defaults');

var _ = require('lodash');
var td = require('testdouble');
var expect = require('chai').expect;
var proxyquire = require('proxyquire');

describe('fileProcessor.spec.js', function () {
	var readFileMock;
	var fileProcessor;

	beforeEach(function () {
		readFileMock = td.function();
		fileProcessor = proxyquire('../lib/fileProcessor', {
			fs: {readFile: readFileMock}
		});
	});

	it('should configure base path for files', function (done) {
		var options = {basePath: 'path/to/'};
		var file = 'path/to/html/file.html';
		td.when(readFileMock(file)).thenCallback(null, 'html');
		var collector = fileProcessor(_.defaults(options, defaults));

		//when
		collector([file])

		//then
			.then(function (entries) {
				expect(entries[0].path).to.eql('html/file.html');
			})
			.then(done);
	});

	it('should read all files content', function (done) {
		//given
		td.when(readFileMock('file1.html')).thenCallback(null, '<b>file1</b>');
		td.when(readFileMock('file2.html')).thenCallback(null, '<b>file2</b>');

		//when
		fileProcessor(defaults)(['file1.html', 'file2.html'])

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
		td.when(readFileMock('file1.html')).thenCallback(null, '  file1  ');
		td.when(readFileMock('file2.html')).thenCallback(null, '  file2  ');

		//when
		fileProcessor(defaults)(['file1.html', 'file2.html'])

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
					var options = {
						whitespace: params.whitespace
					};
					var collector = fileProcessor(_.defaults(options, defaults));

					//given
					td.when(readFileMock('file.html')).thenCallback(null, params.rawHtml);

					//when
					collector(['file.html'])

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
				td.when(readFileMock('file.html')).thenCallback(null, params.rawHtml);

				//when
				fileProcessor(defaults)(['file.html'])

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
				var options = {quotmark: params.quotmarkType};
				var collector = fileProcessor(_.defaults(options, defaults));

				td.when(readFileMock('file.html')).thenCallback(null, params.rawHtml);

				//when
				collector(['file.html'])

				//then
					.then(function (entries) {
						expect(entries[0].html).to.eql(params.fixedHtml);
					})
					.then(done);
			});
		});

	});
});

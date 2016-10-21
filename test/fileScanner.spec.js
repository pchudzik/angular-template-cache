'use strict';

var td = require('testdouble');
var proxyquire = require('proxyquire');
var expect = require('chai').expect;

describe('fileScanner.spec.js', function () {
	var globMock;
	var fileScanner;

	beforeEach(function () {
		globMock = td.function();
		fileScanner = proxyquire('../lib/fileScanner', {
			glob: globMock
		});
	});

	it('should find files using glob pattern when provided', function (done) {
		//given
		var globPattern = '**html';
		var fileName = 'file1.html';
		td.when(globMock(globPattern)).thenCallback(null, [fileName]);

		//when
		fileScanner(globPattern, [])

			//then
			.then(function (result) {
				expect(result).to.eql([fileName]);
			})
			.then(done);

	});

	it('should use only input fileList when glob pattern missing', function (done) {
		//given
		var fileName = 'file1.html';

		//when
		fileScanner(null, [fileName])

			//then
			.then(function (result) {
				expect(result).to.eql([fileName]);
			})
			.then(done);
	});

	it('should use sum of glob pattern files and input file list', function (done) {
		//given
		var file1 = 'file1.html';
		var file2 = 'file2.htm';
		var globPattern = '**htm';
		td.when(globMock(globPattern)).thenCallback(null, [file2]);

		//when
		fileScanner(globPattern, [file1])

			//then
			.then(function (result) {
				expect(result).to.eql([file2, file1]);
			})
			.then(done);
	});

	it('should skip duplicated files detected using glob pattern and input file list', function (done) {
		//given
		var globPattern = '**html';
		var file = 'file.html';
		var otherFile1 = 'file1.html';
		var otherFile2 = 'file2.html';
		td.when(globMock(globPattern)).thenCallback(null, [file, otherFile1]);

		//when
		fileScanner(globPattern, [file, otherFile2])

			//then
			.then(function (result) {
				expect(result).to.eql([file, otherFile1, otherFile2]);
			})
			.then(done);
	});
});

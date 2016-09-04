'use strict';

var td = require('testdouble');
var fs = require('fs');
var expect = require('chai').expect;
var resultSaver = require('../lib/resultSaver');

describe('resultSaver.spec.js', function () {
	var resultToSave = 'result to save';
	var options;

	var writeFileMock;
	var stdoutWriteMock;

	beforeEach(function () {
		options = {};
		writeFileMock = td.replace(fs, 'writeFile');
		stdoutWriteMock = td.replace(process.stdout, 'write');
	});

	afterEach(function () {
		td.reset();
	});

	it('should save result to file', function () {
		//given
		options.output = 'result.js';
		var saver = resultSaver(options);

		//when
		saver(resultToSave);

		//then
		td.verify(writeFileMock(
			options.output,
			resultToSave,
			td.matchers.anything()));
	});

	it('should print output to stdout', function () {
		//given
		var saver = resultSaver(options);

		//when
		saver(resultToSave);

		//then
		td.verify(stdoutWriteMock(
			resultToSave,
			td.matchers.isA(Function)
		));
	});

	[null, 'result.js']
		.forEach(function (outputType) {
			it('return promise from resultSaver', function () {
				//given
				options.output = outputType;
				var saver = resultSaver(options);

				//expect
				expect(saver(resultToSave).then).to.be.a('function');
				expect(saver(resultToSave).catch).to.be.a('function');
			});
		});
});

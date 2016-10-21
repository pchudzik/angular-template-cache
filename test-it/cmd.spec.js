'use strict';

var exec = require('child_process').exec;
var fs = require('fs');

var expect = require('chai').expect;

describe('cmd.spec.js', function () {
	['browser', 'es2015', 'browserify'].forEach(function (style) {
		it('should generate files using ' + style + ' style', function (done) {
			var cmdArgs = [
				'-f "test-it/**html"',
				'-s ' +style,
				'--htmlmin-minifyCSS',
				'--htmlmin-minifyJS',
				'--htmlmin-collapseWhitespace'
			].join(' ');

			exec('bin/cmd.js ' + cmdArgs, function(err, stdout) {
				expect(stdout).to.eql(fs.readFileSync('test-it/expected/' + style + '.js').toString());

				done();
			});
		});
	});

	it('should load all files passed as extra args', function(done) {
		var cmdArgs = [
			'-s browser',
			'--htmlmin-minifyCSS',
			'--htmlmin-minifyJS',
			'--htmlmin-collapseWhitespace',
			'--',
			'test-it/first.html',
			'test-it/second.html'
		].join(' ');

		exec('bin/cmd.js ' + cmdArgs, function(err, stdout) {
			expect(stdout).to.eql(fs.readFileSync('test-it/expected/browser.js').toString());

			done();
		});
	});

	it('should load all html files from current folder if no glob pattern nor file list provided', function (done) {
		var cmdArgs = [
			'-s browser',
			'--htmlmin-minifyCSS',
			'--htmlmin-minifyJS',
			'--htmlmin-collapseWhitespace'
		].join(' ');

		exec('(cd test-it && ../bin/cmd.js ' + cmdArgs + ')', function(err, stdout) {
			var expectedFileContent = fs.readFileSync('test-it/expected/browser.js')
				.toString()
				.replace(new RegExp('test-it/', 'g'), '');

			expect(stdout).to.eq(expectedFileContent);

			done();
		});
	});
});

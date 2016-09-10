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
});

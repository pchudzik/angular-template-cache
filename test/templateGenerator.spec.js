'use strict';

var defaults = require('../lib/defaults');

var templateGenerator = require('../lib/templateGenerator');

var _ = require('lodash');
var expect = require('chai').expect;

describe('templateGenerator.spec.js', function () {
	var useStrictString = '\'use strict\';\n\n';
	var defaultHeaderString = defaults.header + '\n\n';
	var browserAngular = 'angular\n';
	var browserifyAngular = 'var templatesModule = require(\'angular\')\n';
	var es2015Angular = 'import angular from \'angular\';\n\nconst templatesModule = angular\n';
	var typescriptAngular = 'import * as angular from \'angular\';\n\nexport const templatesModule = angular\n';
	var defaultModuleString = '\t.module(\'templates\', [])\n';
	var defaultRunString = '\t.run([\'$templateCache\', function($templateCache) {\n';
	var browserSuffix = '\t}\n]);\n';
	var browserifySuffix = '\t}\n]);\n\nmodule.exports = templatesModule;\n';
	var es2015Suffix = '\t}\n]);\n\nexport default templatesModule;\n';
	var typescriptSuffix = '\t}\n]);\n';

	it('should wrap all entries in template', function (done) {
		//given
		var generator = templateGenerator(defaults);

		//when
		generator([
			{path: 'file1.html', html: '\'html1\''},
			{path: 'file2.html', html: '\'html2\''}
		])
			.then(function (result) {
				expect(result).to.eql(
					useStrictString +
					defaultHeaderString +
					browserAngular +
					defaultModuleString +
					defaultRunString +
					'\t\t$templateCache.put(\'file1.html\', \'html1\');\n\n' +
					'\t\t$templateCache.put(\'file2.html\', \'html2\');\n' +
					browserSuffix);
			})
			.then(done);
	});

	[
		{type: 'spaces', whitespace: '    '},
		{type: 'tabs', whitespace: '\t'}
	].forEach(function (params) {
		it('should use whitespace of type ' + params.type, function (done) {
			var options = {whitespace: params.type};

			//given
			var generator = templateGenerator(_.defaults(options, defaults));

			//when
			generator([{path: 'f.html', html: '\'f\''}])

			//then
				.then(function (result) {
					expect(result).to.eql(
						[
							useStrictString,
							defaultHeaderString,
							browserAngular,
							params.whitespace, '.module(\'templates\', [])\n',
							params.whitespace, '.run([\'$templateCache\', function($templateCache) {\n',
							params.whitespace, params.whitespace, '$templateCache.put(\'f.html\', \'f\');\n',
							params.whitespace, '}\n',
							']);', '\n'
						].join('')
					);
				})
				.then(done);
		});
	});

	[
		{quotmarkType: 'double', quotmark: '"'},
		{quotmarkType: 'single', quotmark: '\''}
	].forEach(function (params) {
		it('should use provided quotmark ' + params.quotmarkType, function (done) {
			//given
			var options = {quotmark: params.quotmarkType};
			var generator = templateGenerator(_.defaults(options, defaults));

			//when
			generator([])

			//then
				.then(function (result) {
					expect(result).to.eql(
						[
							params.quotmark, 'use strict', params.quotmark, ';\n\n',
							defaultHeaderString,
							browserAngular,
							'\t.module(', params.quotmark, 'templates', params.quotmark, ', [])\n',
							'\t.run([', params.quotmark, '$templateCache', params.quotmark, ', function($templateCache) {\n\n',
							browserSuffix
						].join('')
					);
				})
				.then(done);
		});
	});

	it('should use provided TS type', function (done) {
		//given
		var options = {serviceType: 'ng.ITemplateCacheService'};
		var generator = templateGenerator(_.defaults(options, defaults));

		//when
		generator([])

		//then
			.then(function (result) {
				expect(result).to.eql(
					[
						useStrictString +
						defaultHeaderString +
						browserAngular +
						defaultModuleString +
						'\t.run([\'$templateCache\', function($templateCache: ng.ITemplateCacheService) {\n\n' +
						browserSuffix
					].join('')
				);
			})
			.then(done);
	});

	it('should use provided module name', function (done) {
		//given
		var moduleName = 'my-html';
		var options = {moduleName: moduleName};
		var generator = templateGenerator(_.defaults(options, defaults));

		//when
		generator([])
		//then
			.then(function (result) {
				expect(result).to.contain(
					'\t.module(\'' + moduleName + '\', [])\n'
				);
			})
			.then(done);
	});

	it('should skip new module creation', function (done) {
		//given
		var options = {newModule: false};
		var generator = templateGenerator(_.defaults(options, defaults));

		//when
		generator([])
		//then
			.then(function (result) {
				expect(result).to.contain('\t.module(\'templates\')\n');
			})
			.then(done);
	});

	it('should skip strict mode', function (done) {
		//given
		var options = {strict: false};
		var generator = templateGenerator(_.defaults(options, defaults));

		//when
		generator([])

		//then
			.then(function (result) {
				expect(result).to.not.contain(useStrictString);
			})
			.then(done);
	});

	[
		{type: 'browser', expectedPrefix: browserAngular, expectedSuffix: browserSuffix},
		{type: 'browserify', expectedPrefix: browserifyAngular, expectedSuffix: browserifySuffix},
		{type: 'es2015', expectedPrefix: es2015Angular, expectedSuffix: es2015Suffix},
		{type: 'typescript', expectedPrefix: typescriptAngular, expectedSuffix: typescriptSuffix}
	].forEach(function (params) {
		it('should use code type for ' + params.type, function (done) {
			//given
			var options = {style: params.type};
			var generator = templateGenerator(_.defaults(options, defaults));

			//when
			generator([])

			//then
				.then(function (result) {
					expect(result).to.eql(
						[
							useStrictString,
							defaultHeaderString,
							params.expectedPrefix,
							defaultModuleString,
							defaultRunString,
							'\n',
							params.expectedSuffix
						].join('')
					);
				})
				.then(done);
		});
	});

	it('should use custom file header', function (done) {
		//given
		var header = '//generated templates.js';
		var options = {header: header};
		var generator = templateGenerator(_.defaults(options, defaults));

		//when
		generator([])

			//then
			.then(function(result) {
				expect(result).to.contain(header);
			})
			.then(done);
	});

	it('should use custom prefix', function(done) {
		//given
		var customPrefix = 'broken but custom prefix';
		var options = {prefix: customPrefix};
		var generator = templateGenerator(_.defaults(options, defaults));

		//when
		generator([])

		//then
			.then(function(result) {
				expect(result).to.contain(customPrefix);
			})
			.then(done);
	});

	it('should use custom suffix', function (done) {
		var customSuffix = 'broken but custom suffix';
		var options = {suffix: customSuffix};
		var generator = templateGenerator(_.defaults(options, defaults));

		//when
		generator([])

		//then
			.then(function(result) {
				expect(result).to.contain(customSuffix);
			})
			.then(done);
	});

});

'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var optionsHelper = require('./optionsHelper');

var templatesModuleVariableName = 'templatesModule';

module.exports = function templateGeneratorFactory(options) {
	return _.partial(wrapInTemplateCache, options);
};

function wrapInTemplateCache(options, entries) {
	var whitespace = optionsHelper.selectWhitespace(options.whitespace);
	var quotmark = optionsHelper.selectQuote(options.quotmark);

	function quote(string) {
		return quotmark + string + quotmark;
	}

	function createContentPrefix() {
		var maybeNewModule = options.newModule ? ', []' : '';
		return selectAngularImportStyle(options.style) +
			whitespace + '.module(' + quote(options.moduleName) + maybeNewModule + ')\n' +
			whitespace + '.run([' + quote('$templateCache') + ', function($templateCache) {';
	}

	function createContentSuffix() {
		return '\n' + whitespace + '}\n]);' + selectDefaultSuffixStyle(options.style);
	}

	var moduleContent = _.map(entries, function (entry) {
		return whitespace + whitespace + '$templateCache.put(' +
			quote(entry.path) +
			', ' +
			entry.html +
			');';
	});

	var maybeStrictDeclaration = options.strict ? quote('use strict') + ';\n\n' : '';

	return Promise.resolve(
		maybeStrictDeclaration +
		options.header + '\n\n' +
		(options.prefix || createContentPrefix()) + '\n' +
		moduleContent.join('\n\n') +
		(options.suffix || createContentSuffix()) +
		'\n'
	);
}

function selectAngularImportStyle(style) {
	switch (style) {
		case 'browser':
			return 'angular\n';
		case 'browserify':
			return ['var ', templatesModuleVariableName, ' = ', 'require(\'angular\')\n'].join('');
		case 'es2015':
			return ['import angular from \'angular\';\n\n', 'const ', templatesModuleVariableName, ' = angular\n'].join('');
	}
}

function selectDefaultSuffixStyle(style) {
	switch(style) {
		case 'browser':
			return '';
		case 'browserify':
			return '\n\nmodule.exports = ' + templatesModuleVariableName + ';';
		case 'es2015':
			return '\n\nexport default ' + templatesModuleVariableName + ';';
	}
}

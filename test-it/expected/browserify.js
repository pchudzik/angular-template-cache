'use strict';

// file automatically generated by angular-template-cache

var templatesModule = require('angular')
	.module('templates', [])
	.run(['$templateCache', function($templateCache) {
		$templateCache.put('test-it/first.html', '<style>\n' +
			'	p {\n' +
			'		background: red;\n' +
			'	}\n' +
			'</style>\n' +
			'\n' +
			'<p class="custom class">\n' +
			'	Custom file\n' +
			'</p>');

		$templateCache.put('test-it/second.html', '<script>\n' +
			'	alert(\'hello world\')\n' +
			'</script>\n' +
			'\n' +
			'<div>\n' +
			'	<b>hello</b>\n' +
			'</div>');
	}
]);

module.exports = templatesModule;

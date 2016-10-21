#!/usr/bin/env node

'use strict';

var program = require('commander');
var _ = require('lodash');

var defaults = require('../lib/defaults');
var parseHtmlMinOptions = require('../lib/htmlminOptionsParser');
var html2js = require('../index');

program
	.option('-f, --files [filesGlobPattern]', 'glob pattern to locate files. Quote it to make it work in bash')
	.option('-o, --output [file]', 'output file. stdout when missing. default stdout')
	.option('-p, --base-path [path]', 'base path to be used in file url. Empty by default')
	.option('-s, --style [style]', 'code type to generate [browser|browserify|es2015]. default is ' + defaults.style)
	.option('-m, --module-name [name]', 'name of the module. [templates]', 'templates')

	.option('--no-htmlmin', 'minify html', !defaults.htmlmin)

	.option('--no-new-module', 'reuse existing module instead of creating new one', !defaults.newModule)

	.option('--no-strict', 'skip use strict expression', !defaults.strict)
	.option('--header [header content]', 'file header to be put on top of the file')

	.option('--prefix [prefix]', 'content prefix. default is generated based on --style, --module, --no-new-module')
	.option('--suffix [suffix]', 'content suffix. default: }]);')

	.option('--quotmark [quotmark]', 'quotation mark to use. [\'|"] [sing quote|double quote]. single quote by default', '\'')
	.option('--whitespace [whitespace]', 'whitespace type. [tabs|spaces]. tabs is default.', 'tabs')

	.allowUnknownOption(true);

program.on('--help', function() {
	console.log('Files selection');
	console.log('    Files to process can be specified using -f or --files option and passing glob pattern');
	console.log('        Example: nghtml2js -f "**html"   # will load all html files in all folders');
	console.log('    File list can also be passed as arguments');
	console.log('        Example: ng2htmljs -s es2015 -- file.html folder/file2.html   # will load only file1.html and file2.html from folder');
	console.log('    Glob pattern and files list can be mixed. It will produce sum of glob and files (without duplicated)');
	console.log('        Example: nghtml2js -f templates/**html -- index.html   # will load all html files from folder templates, and index.html from cwd');
	console.log('    if no glob pattern nor file list is provided then glob pattern "**/*html" is used');
});

program.parse(process.argv);

var options = _.defaults({
	output: program.output,
	strict: program.strict,
	style: program.style,
	header: program.header,
	moduleName: program.moduleName,
	newModule: program.newModule,
	basePath: program.basePath,
	qutomark: program.quotmark,
	whitespace: program.whitespace,
	prefix: program.prefix,
	suffix: program.suffix,
	filesGlob: resolveGlob(program.files, program.args),
	fileList: program.args,
	htmlmin: program.htmlmin,
	htmlminOptions: parseHtmlMinOptions(program.rawArgs)
}, defaults);

html2js(options);

function resolveGlob(globPattern, fileList) {
	return (_.isEmpty(globPattern) || _.isUndefined(globPattern)) && _.isEmpty(fileList) ? '**html' : globPattern;
}

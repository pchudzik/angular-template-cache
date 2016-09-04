#!/usr/bin/env node

var program = require('commander');
var _ = require('lodash');
var defaults = require('../lib/defaults');
var html2js = require('../index');

var fs = require('fs');

program
	.option('-f, --files <files>', 'glob pattern to locate files. Quote it to make it work in bash. default: ' + defaults.files)
	.option('-o, --output [file]', 'output file. stdout when missing. default stdout')
	.option('-p, --base-path [path]', 'base path to be used in file url. Empty by default')
	.option('-s, --style [style]', 'code type to generate [browser|browserify|es2015]. default is ' + defaults.style)
	.option('-m, --module [name]', 'name of the module. [templates]', 'templates')

	.option('--no-new-module', 'reuse existing module instead of creating new one', !defaults.newModule)

	.option('--no-strict', 'skip use strict expression', !defaults.strict)
	.option('--header [header content]', 'file header to be put on top of the file')

	.option('--prefix [prefix]', 'content prefix. default is generated based on --style, --module, --no-new-module')
	.option('--suffix [suffix]', 'content suffix. default: }]);')

	.option('--quotmark [quotmark]', 'quotation mark to use. [\'|"] [sing quote|double quote]. single quote by default', '\'')
	.option('--whitespace [whitespace]', 'whitespace type. [tabs|spaces]. tabs is default.', 'tabs')

	.parse(process.argv);

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
	files: program.files
}, defaults);

html2js(options);

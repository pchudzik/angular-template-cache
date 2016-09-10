'use strict';

var _ = require('lodash');

var htmlminPrefix = '--htmlmin-';

module.exports = function parseRawArgs(rawArgs) {
	return _.chain(rawArgs)
		.filter(function (arg) {
			return _.startsWith(arg, htmlminPrefix);
		})
		.reduce(function (result, arg) {
			var key = arg.replace(htmlminPrefix, '');
			var isPositive = true;
			if(_.startsWith(key, 'no-')) {
				key = key.replace('no-', '');
				isPositive = false;
			}
			return _.set(result, key, true && isPositive);
		}, {})
		.value();
};

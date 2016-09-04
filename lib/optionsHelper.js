'use strict';

module.exports = {
	selectWhitespace: function (whitespaceOption) {
		return whitespaceOption === 'tabs' ? '\t' : '    ';
	},
	selectQuote: function(quoteType) {
		return quoteType === 'single' ? '\'' : '"';
	}
};

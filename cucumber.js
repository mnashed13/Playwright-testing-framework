const { generateHtml } = require('@cucumber/html-formatter');
const fs = require('fs');

module.exports = {
	default: {
		paths: ['api-tests/features/**/*.feature'],
		require: ['api-tests/steps/**/*.ts', 'api-tests/support/**/*.ts'],
		requireModule: ['ts-node/register'],
		format: [
			'progress-bar',
			'html:reports/cucumber-report.html',
			'json:reports/cucumber-report.json',
		],
		formatOptions: {
			snippetInterface: 'async-await',
		},
	},
};

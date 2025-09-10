const common = {
	requireModule: ['ts-node/register'],
	formatOptions: { snippetInterface: 'async-aware' },
	format: [
		'html:test-results/cucumber-report.html',
		'json:test-results/cucumber-report.json',
		'summary',
	],
	parallel: process.env.PARALLEL_TESTS
		? parseInt(process.env.PARALLEL_TESTS)
		: 1,
};

module.exports = {
	default: {
		...common,
		require: ['src/steps/*.ts', 'src/support/*.ts'],
		paths: ['src/features/*.feature'],
	},
	headed: {
		...common,
		require: ['src/steps/*.ts', 'src/support/*.ts'],
		paths: ['src/features/*.feature'],
		worldParameters: { headless: false },
	},
	lambdatest: {
		...common,
		require: ['src/steps/*.ts', 'src/support/*.ts'],
		paths: ['src/features/*.feature'],
		worldParameters: {
			lambdatest: true,
			browser: process.env.LT_BROWSER || 'chrome',
			platform: process.env.LT_PLATFORM || 'Windows 10',
			browserVersion: process.env.LT_BROWSER_VERSION || 'latest',
		},
		parallel: process.env.LT_PARALLEL || 5,
	},
	api: {
		...common,
		require: ['api-tests/steps/*.ts', 'api-tests/support/*.ts'],
		paths: ['api-tests/features/*.feature'],
	},
	all: {
		...common,
		require: [
			'src/steps/*.ts',
			'src/support/*.ts',
			'api-tests/steps/*.ts',
			'api-tests/support/*.ts',
		],
		paths: ['src/features/*.feature', 'api-tests/features/*.feature'],
	},
};

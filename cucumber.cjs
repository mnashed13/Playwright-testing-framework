const common = {
	requireModule: ['ts-node/register'],
	formatOptions: { snippetInterface: 'async-aware' },
	format: ['html:test-results/cucumber-report.html', 'summary'],
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

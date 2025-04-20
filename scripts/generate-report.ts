const fs = require('fs');
const path = require('path');
const { ReportGenerator } = require('../api-tests/support/report-generator');

try {
	const jsonReportPath = path.join(
		process.cwd(),
		'reports',
		'cucumber-report.json'
	);

	// Create reports directory if it doesn't exist
	if (!fs.existsSync('reports')) {
		fs.mkdirSync('reports', { recursive: true });
	}

	// Check if report exists
	if (fs.existsSync(jsonReportPath)) {
		const jsonReport = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
		ReportGenerator.generateCustomReport(jsonReport);
		console.log('Report generated successfully');
	} else {
		console.log('No cucumber-report.json found');
	}
} catch (error) {
	console.error('Error generating report:', error);
}

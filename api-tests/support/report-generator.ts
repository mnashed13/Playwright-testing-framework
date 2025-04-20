import { CurlFormatter } from './curl-formatter';
import fs from 'fs';
import path from 'path';

export class ReportGenerator {
	static generateCustomReport(jsonReport: any) {
		const template = `
<!DOCTYPE html>
<html>
<head>
    <title>API Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .scenario { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
        .step { margin: 10px 0; }
        .passed { color: green; }
        .failed { color: red; }
        .curl-command { 
            background: #f4f4f4; 
            padding: 10px; 
            border-radius: 4px;
            white-space: pre;
            overflow-x: auto;
        }
        .copy-button {
            float: right;
            padding: 5px 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>API Test Report</h1>
    ${this.generateScenarioHtml(jsonReport)}
    <script>
        function copyToClipboard(elementId) {
            const el = document.getElementById(elementId);
            navigator.clipboard.writeText(el.textContent);
            alert('Copied to clipboard!');
        }
    </script>
</body>
</html>`;

		const reportPath = path.join(
			process.cwd(),
			'reports',
			'custom-report.html'
		);
		fs.writeFileSync(reportPath, template);
	}

	private static generateScenarioHtml(jsonReport: any): string {
		// Implementation of HTML generation for scenarios
		// This is a placeholder - implement based on your JSON report structure
		return '';
	}
}

# LambdaTest Integration Setup Guide

This guide will help you set up and configure LambdaTest integration with your Playwright + Cucumber testing framework.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- LambdaTest account (sign up at [lambdatest.com](https://lambdatest.com))
- Git repository with GitHub Actions enabled

### 2. Get LambdaTest Credentials

1. Log in to your [LambdaTest account](https://accounts.lambdatest.com/login)
2. Go to [Profile & Settings](https://accounts.lambdatest.com/profile)
3. Copy your `Username` and `Access Key`

### 3. Environment Setup

#### Local Development

1. Copy the environment template:

   ```bash
   cp lambdatest.env.example .env
   ```

2. Update `.env` with your credentials:
   ```bash
   LT_USERNAME=your_actual_username
   LT_ACCESS_KEY=your_actual_access_key
   BASE_URL=https://your-app-url.com
   ```

#### GitHub Actions Setup

1. Go to your GitHub repository settings
2. Navigate to `Settings > Secrets and variables > Actions`
3. Add the following **Repository Secrets**:

   - `LT_USERNAME`: Your LambdaTest username
   - `LT_ACCESS_KEY`: Your LambdaTest access key

4. Add the following **Repository Variables**:
   - `BASE_URL`: Your application URL (e.g., `https://your-app.com`)

## 🧪 Running Tests

### Local Execution (with LambdaTest)

```bash
# Install dependencies
npm install

# Run smoke tests on LambdaTest
npm run test:lambdatest:smoke

# Run regression tests on LambdaTest
npm run test:lambdatest:regression

# Run parallel tests (5 concurrent sessions)
npm run test:lambdatest:parallel

# Run with custom tags
npm run test:lambdatest -- --tags "@critical"
```

### Local Execution (without LambdaTest)

```bash
# Run tests locally
npm run test:headed

# Run API tests
npm run test:api
```

### GitHub Actions

#### Automatic Triggers

- **Push to main/develop/lambda-test**: Runs smoke tests
- **Pull Requests**: Runs smoke tests and comments results
- **Daily Schedule**: Runs full regression suite at 2 AM UTC

#### Manual Triggers

1. Go to `Actions` tab in your GitHub repository
2. Select `LambdaTest UI Tests` workflow
3. Click `Run workflow`
4. Choose your options:
   - Environment (staging/production)
   - Browser (chrome/firefox/edge/safari)
   - Platform (Windows 10/11, macOS)
   - Test tags (@smoke, @regression, etc.)

## ⚙️ Configuration Options

### Browser & Platform Matrix

The framework supports testing across multiple browser/platform combinations:

| Browser | Platforms              | Versions                  |
| ------- | ---------------------- | ------------------------- |
| Chrome  | Windows 10/11, macOS   | latest, specific versions |
| Firefox | Windows 10, macOS      | latest, specific versions |
| Edge    | Windows 10/11          | latest, specific versions |
| Safari  | macOS Big Sur/Monterey | latest                    |

### Environment Variables

| Variable        | Description              | Default        | Required |
| --------------- | ------------------------ | -------------- | -------- |
| `LT_USERNAME`   | LambdaTest username      | -              | ✅       |
| `LT_ACCESS_KEY` | LambdaTest access key    | -              | ✅       |
| `LT_BUILD_NAME` | Build name in LambdaTest | Auto-generated | ❌       |
| `LT_BROWSER`    | Browser to use           | chrome         | ❌       |
| `LT_PLATFORM`   | Platform to use          | Windows 10     | ❌       |
| `LT_PARALLEL`   | Parallel sessions        | 5              | ❌       |
| `BASE_URL`      | Application URL          | -              | ✅       |

### Cucumber Profiles

| Profile      | Description           | Command                   |
| ------------ | --------------------- | ------------------------- |
| `default`    | Local execution       | `npm test`                |
| `headed`     | Local with browser UI | `npm run test:headed`     |
| `lambdatest` | LambdaTest execution  | `npm run test:lambdatest` |
| `api`        | API tests only        | `npm run test:api`        |

## 📊 Test Reporting

### Automated Reports

1. **Cucumber HTML Reports**: Generated in `test-results/cucumber-report.html`
2. **JSON Reports**: Available in `test-results/cucumber-report.json`
3. **Screenshots**: Saved in `screenshots/` directory
4. **LambdaTest Dashboard**: Automatic integration with test results

### GitHub Actions Integration

- **PR Comments**: Automatic test result comments on pull requests
- **Job Summaries**: Detailed results in GitHub Actions summary
- **Artifacts**: Test reports and screenshots uploaded as artifacts
- **Status Checks**: Pass/fail status for PR merge requirements

## 🔧 Advanced Configuration

### Custom Capabilities

Edit `lambdatest.config.ts` to customize LambdaTest capabilities:

```typescript
export const lambdaTestCapabilities = {
	'LT:Options': {
		platform: 'Windows 10',
		browserName: 'Chrome',
		browserVersion: 'latest',
		build: 'My Custom Build',
		name: 'My Test',
		network: true,
		video: true,
		console: true,
		tunnel: false,
		// Add custom capabilities
		timezone: 'UTC',
		resolution: '1920x1080',
		selenium_version: '4.0.0',
	},
};
```

### Parallel Execution

Configure parallel execution in `cucumber.cjs`:

```javascript
lambdatest: {
  ...common,
  parallel: process.env.LT_PARALLEL || 5,
  worldParameters: {
    lambdatest: true,
    // Custom world parameters
  }
}
```

### Custom Test Tags

Organize tests with Cucumber tags:

```gherkin
@smoke @critical
Feature: User Login

  @regression
  Scenario: Valid login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

Run specific tags:

```bash
npm run test:lambdatest -- --tags "@smoke and @critical"
npm run test:lambdatest -- --tags "not @skip"
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Timeout**

   - Check your internet connection
   - Verify LambdaTest credentials
   - Check if your firewall blocks WebSocket connections

2. **Tests Not Starting**

   - Verify environment variables are set
   - Check LambdaTest account limits
   - Ensure valid browser/platform combination

3. **Screenshots Not Capturing**
   - Check screenshot directory permissions
   - Verify LambdaTest video/screenshot settings
   - Check available disk space

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run test:lambdatest
```

### LambdaTest Logs

Access detailed logs in the [LambdaTest Dashboard](https://automation.lambdatest.com/build):

- Console logs
- Network logs
- Selenium logs
- Video recordings

## 📞 Support

- **LambdaTest Documentation**: [docs.lambdatest.com](https://docs.lambdatest.com)
- **LambdaTest Support**: [support.lambdatest.com](https://support.lambdatest.com)
- **GitHub Issues**: Create an issue in this repository
- **Community**: [LambdaTest Community](https://community.lambdatest.com)

## 🎯 Best Practices

1. **Test Organization**

   - Use meaningful test names
   - Group related tests with tags
   - Keep tests independent and atomic

2. **Resource Management**

   - Monitor parallel session limits
   - Use appropriate timeouts
   - Clean up resources in hooks

3. **CI/CD Integration**

   - Use matrix strategies for cross-browser testing
   - Set up proper retry mechanisms
   - Monitor test execution costs

4. **Reporting**
   - Include screenshots for failed tests
   - Use descriptive build names
   - Tag builds with version numbers

## 🔄 Migration Guide

### From Local to LambdaTest

1. Update your test scripts to use LambdaTest profile:

   ```bash
   # Before
   npm run test:headed

   # After
   npm run test:lambdatest
   ```

2. Set environment variables as described above

3. Update CI/CD pipelines to use new GitHub Actions workflows

### From Other Cloud Providers

1. Replace existing WebDriver configurations with LambdaTest setup
2. Update capability mappings in `lambdatest.config.ts`
3. Migrate existing test reports to new format
4. Update environment variable names

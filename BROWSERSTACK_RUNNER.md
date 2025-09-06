# BrowserStack Test Runner

This guide shows you how to run your Playwright tests on BrowserStack and post results to the BrowserStack dashboard.

## 🚀 Quick Start

### 1. Set up your credentials

Create a `.env` file in your project root:

```bash
# BrowserStack Credentials
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key

# Optional Configuration
BROWSERSTACK_PROJECT_NAME=Playwright Testing Framework
BROWSERSTACK_BUILD_NAME=build_$(date +%s)
BROWSERSTACK_SESSION_NAME=playwright_test_session
BASE_URL=https://your-app-url.com
```

### 2. Run tests

```bash
# Run UI tests on BrowserStack
npm run run-browserstack

# Run smoke tests
npm run run-browserstack:smoke

# Run mobile tests
npm run run-browserstack:mobile

# Run all browsers in parallel
npm run run-browserstack:parallel

# Run with debug mode
npm run run-browserstack:debug
```

## 📋 Available Commands

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run run-browserstack` | Run UI tests on BrowserStack |
| `npm run run-browserstack:smoke` | Run smoke tests only |
| `npm run run-browserstack:mobile` | Run mobile device tests |
| `npm run run-browserstack:parallel` | Run all browsers in parallel |
| `npm run run-browserstack:debug` | Run with debug mode enabled |

### Direct Script Execution

```bash
# Using Node.js script
node run-browserstack-tests.js [options]

# Using Bash script
./scripts/run-browserstack.sh [options]
```

## 🎯 Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--test-type <type>` | Test type: ui, api, all, smoke, cucumber | `--test-type smoke` |
| `--browser <browser>` | Specific browser: chrome, firefox, safari, edge | `--browser chrome` |
| `--mobile` | Run mobile tests | `--mobile` |
| `--local` | Enable BrowserStack Local | `--local` |
| `--debug` | Enable debug mode | `--debug` |
| `--parallel` | Run tests in parallel | `--parallel` |
| `--help` | Show help message | `--help` |

## 📝 Examples

### Basic Usage

```bash
# Run all UI tests
npm run run-browserstack

# Run specific browser
node run-browserstack-tests.js --browser chrome

# Run mobile tests with debug
node run-browserstack-tests.js --mobile --debug
```

### Advanced Usage

```bash
# Run smoke tests on Chrome
node run-browserstack-tests.js --test-type smoke --browser chrome

# Run all browsers in parallel with debug
node run-browserstack-tests.js --parallel --debug

# Run API tests with local testing
node run-browserstack-tests.js --test-type api --local
```

### Using BrowserStack SDK

```bash
# Run with BrowserStack SDK (using your existing scripts)
npm run test-browserstack
npm run test:headed-browserstack
npm run test:api-browserstack
npm run test:all-browserstack
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BROWSERSTACK_USERNAME` | Your BrowserStack username | Required |
| `BROWSERSTACK_ACCESS_KEY` | Your BrowserStack access key | Required |
| `BROWSERSTACK_PROJECT_NAME` | Project name in BrowserStack | "Playwright Testing Framework" |
| `BROWSERSTACK_BUILD_NAME` | Build name in BrowserStack | "build_[timestamp]" |
| `BROWSERSTACK_SESSION_NAME` | Session name in BrowserStack | "playwright_test_session" |
| `BROWSERSTACK_DEBUG` | Enable debug mode | false |
| `BROWSERSTACK_CONSOLE_LOGS` | Enable console logs | false |
| `BROWSERSTACK_NETWORK_LOGS` | Enable network logs | false |
| `BROWSERSTACK_LOCAL` | Enable BrowserStack Local | false |
| `BASE_URL` | Your application URL | "https://www.google.com" |

### BrowserStack Configuration (browserstack.yml)

Your `browserstack.yml` file controls the BrowserStack SDK behavior:

```yaml
userName: BROWSERSTACK_USERNAME
accessKey: BROWSERSTACK_ACCESS_KEY
projectName: BrowserStack Test Samples
buildName: browserstack build ${BUILD_NUMBER}
buildIdentifier: '#${BUILD_NUMBER}'

platforms:
  - os: OS X
    osVersion: Big Sur
    browserName: Chrome
    browserVersion: latest
  - os: Windows
    osVersion: 10
    browserName: Edge
    browserVersion: latest
  - deviceName: Samsung Galaxy S22 Ultra
    browserName: chrome
    osVersion: 12.0

parallelsPerPlatform: 1
browserstackLocal: true
debug: false
networkLogs: false
consoleLogs: errors
testReporting: true
```

## 📊 Test Results

### Where to Find Results

1. **BrowserStack Dashboard**: https://automate.browserstack.com/dashboard/v2
2. **Local Reports**: 
   - `browserstack-report/index.html` - HTML report
   - `browserstack-results.json` - JSON results
   - `test-results/` - Screenshots and videos
   - `reports/` - Cucumber reports

### Result Files Generated

| File | Description |
|------|-------------|
| `browserstack-results.json` | Test results in JSON format |
| `browserstack-report/index.html` | HTML test report |
| `test-results/cucumber-report.html` | Cucumber HTML report |
| `reports/cucumber-report.html` | Alternative Cucumber report |
| `test-results/` | Screenshots, videos, and logs |

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   # Check your credentials
   echo $BROWSERSTACK_USERNAME
   echo $BROWSERSTACK_ACCESS_KEY
   ```

2. **Connection Timeouts**
   ```bash
   # Test connection
   node test-browserstack.js
   ```

3. **Test Failures**
   - Check BrowserStack dashboard for session logs
   - Review screenshots and videos in `test-results/`
   - Verify your application is accessible from BrowserStack

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Run with debug
npm run run-browserstack:debug

# Or set environment variable
export BROWSERSTACK_DEBUG=true
npm run run-browserstack
```

### Local Testing

If testing against localhost:

```bash
# Enable BrowserStack Local
export BROWSERSTACK_LOCAL=true
npm run run-browserstack
```

## 🔄 CI/CD Integration

### GitHub Actions

Your project includes a GitHub Actions workflow (`.github/workflows/browserstack-ui-tests.yml`) that:

- Runs tests on multiple browsers in parallel
- Includes mobile device testing
- Uploads test results and artifacts
- Supports both Playwright and Cucumber tests

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`
- `BASE_URL` (optional)
- `TEST_USERNAME` (if needed)
- `TEST_PASSWORD` (if needed)

## 📈 Best Practices

1. **Use Parallel Execution**: Run multiple browsers simultaneously for faster results
2. **Enable Debug Mode**: Use debug mode for troubleshooting
3. **Monitor Dashboard**: Check BrowserStack dashboard for detailed session information
4. **Clean Up**: The scripts automatically clean up temporary files
5. **Use Tags**: Use Cucumber tags to run specific test suites

## 🆘 Support

- **BrowserStack Documentation**: https://www.browserstack.com/docs
- **BrowserStack Support**: https://www.browserstack.com/support
- **Project Issues**: Check the main README.md for project-specific help

---

## 🎉 You're Ready!

Your BrowserStack integration is now complete. Run your tests and check the BrowserStack dashboard for detailed results!

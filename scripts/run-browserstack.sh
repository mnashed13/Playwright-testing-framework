#!/bin/bash

# BrowserStack Test Runner Script
# This script runs tests on BrowserStack and posts results

set -e  # Exit on any error

echo "🎯 BrowserStack Test Runner"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="ui"
BROWSER=""
MOBILE=false
LOCAL=false
DEBUG=false
PARALLEL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --mobile)
            MOBILE=true
            shift
            ;;
        --local)
            LOCAL=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --test-type <type>     Test type: ui, api, all, smoke, cucumber (default: ui)"
            echo "  --browser <browser>    Browser: chrome, firefox, safari, edge"
            echo "  --mobile               Run mobile tests"
            echo "  --local                Enable BrowserStack Local"
            echo "  --debug                Enable debug mode"
            echo "  --parallel             Run tests in parallel"
            echo "  --help                 Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0"
            echo "  $0 --test-type smoke --browser chrome"
            echo "  $0 --mobile --debug"
            echo "  $0 --test-type all --parallel"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Function to print colored output
print_status() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate environment
validate_environment() {
    print_status "Validating environment..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found, using environment variables"
    else
        print_success ".env file found"
    fi
    
    # Check if browserstack.yml exists
    if [ ! -f "browserstack.yml" ]; then
        print_warning "browserstack.yml not found, using default configuration"
    else
        print_success "browserstack.yml configuration found"
    fi
    
    # Check if package.json has required scripts
    if ! grep -q "test:browserstack" package.json; then
        print_warning "test:browserstack script not found in package.json"
    else
        print_success "Required npm scripts found"
    fi
    
    echo ""
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Set BrowserStack environment variables
    export BROWSERSTACK_PROJECT_NAME="${BROWSERSTACK_PROJECT_NAME:-Playwright Testing Framework}"
    export BROWSERSTACK_BUILD_NAME="${BROWSERSTACK_BUILD_NAME:-build_$(date +%s)}"
    export BROWSERSTACK_SESSION_NAME="${BROWSERSTACK_SESSION_NAME:-playwright_test_session}"
    
    # Set debugging options
    if [ "$DEBUG" = true ]; then
        export BROWSERSTACK_DEBUG="true"
        export BROWSERSTACK_CONSOLE_LOGS="true"
        export BROWSERSTACK_NETWORK_LOGS="true"
    fi
    
    # Set local testing
    if [ "$LOCAL" = true ]; then
        export BROWSERSTACK_LOCAL="true"
    fi
    
    # Set base URL if not already set
    if [ -z "$BASE_URL" ]; then
        export BASE_URL="https://www.google.com"
    fi
    
    echo "📋 Configuration:"
    echo "   Project: $BROWSERSTACK_PROJECT_NAME"
    echo "   Build: $BROWSERSTACK_BUILD_NAME"
    echo "   Session: $BROWSERSTACK_SESSION_NAME"
    echo "   Debug: $([ "$DEBUG" = true ] && echo "Enabled" || echo "Disabled")"
    echo "   Local: $([ "$LOCAL" = true ] && echo "Enabled" || echo "Disabled")"
    echo "   Base URL: $BASE_URL"
    echo ""
}

# Get test command based on options
get_test_command() {
    local command=""
    
    if [ -n "$BROWSER" ]; then
        # Run specific browser test
        local browser_project="browserstack-$BROWSER"
        if [ "$MOBILE" = true ]; then
            browser_project="${browser_project}-mobile"
        fi
        command="npx playwright test --config=playwright.browserstack.config.ts --project=$browser_project"
    elif [ "$MOBILE" = true ]; then
        # Run mobile tests
        command="npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-chrome-mobile --project=browserstack-safari-mobile"
    elif [ "$PARALLEL" = true ]; then
        # Run all browsers in parallel
        command="npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-chrome --project=browserstack-firefox --project=browserstack-safari --project=browserstack-edge"
    else
        # Use npm script based on test type
        case $TEST_TYPE in
            "ui")
                command="npm run test:browserstack"
                ;;
            "api")
                command="npm run test:api-browserstack"
                ;;
            "all")
                command="npm run test:all-browserstack"
                ;;
            "smoke")
                command="npm run test:browserstack:smoke"
                ;;
            "cucumber")
                command="npm run test:browserstack"
                ;;
            *)
                command="npm run test:browserstack"
                ;;
        esac
    fi
    
    echo "$command"
}

# Run tests
run_tests() {
    print_status "Starting BrowserStack tests..."
    echo ""
    
    local command=$(get_test_command)
    echo "📝 Executing: $command"
    echo ""
    
    local start_time=$(date +%s)
    
    # Run the test command
    if eval "$command"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        print_success "Tests completed successfully in ${duration} seconds!"
        
        # Show results summary
        show_results_summary
        
    else
        print_error "Tests failed!"
        
        # Show failure summary
        show_failure_summary
        
        exit 1
    fi
}

# Show results summary
show_results_summary() {
    echo ""
    echo "📊 Test Results Summary:"
    echo "========================"
    
    # Check for test result files
    local result_files=(
        "browserstack-results.json"
        "browserstack-report/index.html"
        "test-results/cucumber-report.html"
        "reports/cucumber-report.html"
    )
    
    for file in "${result_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file - Generated"
        fi
    done
    
    echo ""
    echo "🌐 View your results:"
    echo "   • BrowserStack Dashboard: https://automate.browserstack.com/dashboard/v2"
    echo "   • Local Reports: Check the browserstack-report/ and test-results/ folders"
    
    if [ -f "browserstack-report/index.html" ]; then
        echo "   • HTML Report: file://$(pwd)/browserstack-report/index.html"
    fi
}

# Show failure summary
show_failure_summary() {
    echo ""
    echo "🔍 Failure Analysis:"
    echo "==================="
    
    # Check for screenshots and videos
    local artifacts=("test-results/" "browserstack-report/" "reports/")
    
    for dir in "${artifacts[@]}"; do
        if [ -d "$dir" ]; then
            echo "📁 Check $dir for screenshots, videos, and logs"
        fi
    done
    
    echo ""
    echo "💡 Troubleshooting Tips:"
    echo "   • Check BrowserStack dashboard for detailed session logs"
    echo "   • Verify your application is accessible from BrowserStack"
    echo "   • Check network connectivity and firewall settings"
    echo "   • Review test logs for specific error messages"
}

# Cleanup function
cleanup() {
    echo ""
    print_status "Cleaning up..."
    
    # Clean up any temporary files if needed
    local temp_files=("browserstack-local.log" "browserstack-local.pid")
    
    for file in "${temp_files[@]}"; do
        if [ -f "$file" ]; then
            rm -f "$file"
            print_success "Cleaned up $file"
        fi
    done
}

# Main execution
main() {
    # Trap to handle cleanup on exit
    trap cleanup EXIT
    
    validate_environment
    setup_environment
    run_tests
    
    echo ""
    print_success "All done! Check your BrowserStack dashboard for detailed results."
}

# Run the main function
main "$@"

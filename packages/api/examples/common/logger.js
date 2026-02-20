/**
 * Simple logging utility for examples
 *
 * Provides consistent, colored console output for example scripts
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Log a success message
 */
function success(message, data = null) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
  if (data) {
    console.log(colors.cyan + JSON.stringify(data, null, 2) + colors.reset);
  }
}

/**
 * Log an error message
 */
function error(message, err = null) {
  console.error(`${colors.red}✗ ${message}${colors.reset}`);
  if (err) {
    if (err.message) {
      console.error(`  ${colors.red}Error: ${err.message}${colors.reset}`);
    }
    if (err.status) {
      console.error(`  ${colors.red}Status: ${err.status}${colors.reset}`);
    }
    if (err.details) {
      console.error(`  ${colors.red}Details:${colors.reset}`, err.details);
    }
  }
}

/**
 * Log an info message
 */
function info(message, data = null) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
  if (data) {
    console.log(colors.cyan + JSON.stringify(data, null, 2) + colors.reset);
  }
}

/**
 * Log a warning message
 */
function warning(message) {
  console.warn(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

/**
 * Log a section header
 */
function section(title) {
  console.log(`\n${colors.bright}${colors.blue}=== ${title} ===${colors.reset}\n`);
}

/**
 * Log a step in a process
 */
function step(number, message) {
  console.log(`${colors.cyan}${number}. ${message}${colors.reset}`);
}

module.exports = {
  success,
  error,
  info,
  warning,
  section,
  step,
};

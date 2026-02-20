#!/usr/bin/env node
/**
 * Wrapper for Jest that adds regex anchors (^ $) to -t/--testNamePattern
 * so only the exact test runs. Fixes vscode-jest running wrong tests when
 * similar test names exist.
 */
const { spawn } = require('child_process');

const args = process.argv.slice(2);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function anchorTestPattern(arg) {
  const match = arg.match(/^--testNamePattern=(.+)$/);
  if (match) {
    const value = match[1].replace(/^["']|["']$/g, '');
    if (value && !value.startsWith('^')) {
      return `--testNamePattern=^${escapeRegex(value)}$`;
    }
  }
  return arg;
}

const tIdx = args.indexOf('-t');
if (tIdx >= 0 && args[tIdx + 1]) {
  const value = args[tIdx + 1].replace(/^["']|["']$/g, '');
  if (value && !value.startsWith('^')) {
    args[tIdx + 1] = `^${escapeRegex(value)}$`;
  }
} else {
  args.forEach((arg, i) => {
    if (arg.startsWith('--testNamePattern=')) {
      args[i] = anchorTestPattern(arg);
    }
  });
}

const child = spawn(
  'pnpm',
  ['--filter', '@oaknetwork/api', 'exec', 'jest', '--coverage', ...args],
  { stdio: 'inherit', cwd: require('path').resolve(__dirname, '../..') }
);

child.on('exit', (code) => process.exit(code ?? 0));

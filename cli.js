#!/usr/bin/env node

const gitCopyHistory = require(".");
const { version } = require("./package.json");

const help = `Usage
  git-copy-history from <source> [options]

Options
  --author <name-or-email>  Filter source commits by author; repeatable.
  --secret <value>         Stable secret used to hash commit IDs.
  --help                   Show this help.
  --version                Show the version.

Example
  git-copy-history from "../my project" --author="Pavel Frankov"
  git-copy-history from ../my-project --author=first@email.tld --author=second@email.tld`;

function valueFor(args, index, name) {
  const arg = args[index];
  const value = arg === name ? args[index + 1] : arg.slice(name.length + 1);
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return { value, nextIndex: arg === name ? index + 1 : index };
}

function parseArgs(args) {
  const positional = [];
  const authors = [];
  const options = {};
  let afterSeparator = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      afterSeparator = true;
    } else if (!afterSeparator && (arg === "--author" || arg.startsWith("--author="))) {
      const parsed = valueFor(args, i, "--author");
      authors.push(parsed.value);
      i = parsed.nextIndex;
    } else if (!afterSeparator && (arg === "--secret" || arg.startsWith("--secret="))) {
      const parsed = valueFor(args, i, "--secret");
      options.secret = parsed.value;
      i = parsed.nextIndex;
    } else if (!afterSeparator && arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length > 2) {
    throw new Error("Expected a command and one source repository path");
  }
  if (authors.length) {
    options.author = authors.length === 1 ? authors[0] : authors;
  }
  return { positional, options };
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(help);
} else if (args.includes("--version") || args.includes("-v")) {
  console.log(version);
} else {
  try {
    const { positional, options } = parseArgs(args);
    gitCopyHistory(positional[0], positional[1], options);
  } catch (error) {
    console.error(`✖ ${error.message}`);
    process.exitCode = 1;
  }
}

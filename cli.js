#!/usr/bin/env node

const meow = require("meow");
const gitCopyHistory = require(".");

const cli = meow(
  `
    Usage
      $ git-copy-history from <source> [options]
 
    Options
      --author          
      
    Example
      $ git-copy-history from ../my-project
      $ git-copy-history from ../my-project --author="Pavel Frankov"
`,
  {
    flags: {}
  }
);

const [command, source] = cli.input;

gitCopyHistory(command, source, cli.flags);

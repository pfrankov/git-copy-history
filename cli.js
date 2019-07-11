#!/usr/bin/env node

const meow = require("meow");
const gitSyncHistory = require(".");

const cli = meow(
    `
    Usage
      $ git-sync-history from <source> [options]
 
    Options
      --author          
      
    Example
      $ git-sync-history from ../my-project
      $ git-sync-history from ../my-project --author="Pavel Frankov"
`,
    {
        flags: {}
    }
);

const [command, source] = cli.input;

gitSyncHistory(command, source, cli.flags);
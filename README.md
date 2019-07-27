# Git Copy History
[![npm version](https://badge.fury.io/js/git-copy-history.svg)](https://www.npmjs.com/package/git-copy-history)

And only the history

![](https://user-images.githubusercontent.com/584632/61998650-da56b800-b0bb-11e9-8b23-3bb9f4959e96.gif)

### Copy commit history from
- <img width="90" src="https://user-images.githubusercontent.com/584632/61998916-8948c300-b0bf-11e9-9888-c56d5d248a62.png"/>
- <img width="120" src="https://user-images.githubusercontent.com/584632/61998918-8b128680-b0bf-11e9-8839-cd8611c62ed9.png"/>
- Or any local Git repository

Example: your repo is not on GitHub so for others it looks like you've just stopped coding at all.
So this CLI takes all of YOUR commits from your local repo and commits only hashes of hashes for exact same time to another repo.
Which can be shared on Github without any restrictions.

## Installation

```bash
npm install -g git-copy-history
```

## Usage

```bash
mkdir just-history
cd just-history
git init

# git-copy-history from <source> [options]
git-copy-history from ../local-repo
```

Please help me to improve this Readme file by sending PR

# Git Copy History

And only the history

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

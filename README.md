# Git Copy History

[![npm version](https://badge.fury.io/js/git-copy-history.svg)](https://www.npmjs.com/package/git-copy-history)

And only the history

![](https://user-images.githubusercontent.com/584632/61998650-da56b800-b0bb-11e9-8b23-3bb9f4959e96.gif)

### Copy your commit history from

- <img width="90" src="https://user-images.githubusercontent.com/584632/61998916-8948c300-b0bf-11e9-9888-c56d5d248a62.png"/>
- <img width="120" src="https://user-images.githubusercontent.com/584632/61998918-8b128680-b0bf-11e9-8839-cd8611c62ed9.png"/>
- Or any other local Git repository

## How it works

Example: your repo is not on GitHub so for others it looks like you've just stopped coding at all.

- This CLI takes all of YOUR commits from your local repo
- It commits only **hashes from hashes** for exact same timestamps to another repo
- This another repository has no private information inside but it has perfectly timed commit history
- It can be shared on GitHub without any restrictions

## Installation

```bash
npm install -g git-copy-history
```

## Limitations

Doesn't work on Windows

## Usage

```bash
# Create new repo
mkdir just-history
cd just-history
git init

# Point git-copy-history to the source repo
# git-copy-history from <source> [options]
git-copy-history from ../local-repo
```

Create private [repository on GitHub](https://github.com/new).
Follow the instructions for existing repositories.

- Add origin to your new repository
- Push the history to the remote repository

## Update history

Just run `git-copy-history` again and it will add only the new commits.

```bash
git-copy-history from ../local-repo
git push
```

> Please help me to improve this Readme file by sending PR

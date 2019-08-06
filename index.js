const ora = require("ora");
const chalk = require("chalk");
const { execSync } = require("child_process");
const crypto = require("crypto");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const HASH_SECRET = "crypto";

module.exports = function(command, source, _options) {
  const options = Object.assign(
    {
      secret: HASH_SECRET,
      author: null
    },
    _options
  );

  function getHistory() {
    let author = options.author;
    if (!author) {
      author = execSync(`cd ${source} && git config user.name`, {
        encoding: "utf8"
      }).replace(/\n/, "");
    }

    return execSync(
      `cd ${source} && git log --pretty="%H|%ad" --date=format:"%Y-%m-%d %H:%M:%S" --author="${author}" --all`,
      { encoding: "utf8" }
    );
  }

  function getCurrentDirHistory() {
    let author = options.author;
    if (!author) {
      author = execSync(`git config user.name`, { encoding: "utf8" });
    }

    return execSync(
      `git log --pretty="%s|%ad" --date=format:"%Y-%m-%d %H:%M:%S" --author="${author}" --all`,
      { encoding: "utf8" }
    );
  }

  function findMissedCommits() {
    const historyArray = getHistory()
      .split("\n")
      .filter(x => x);
    let currentDirHistoryArray = getCurrentDirHistory()
      .split("\n")
      .filter(x => x);

    const missedArray = [];

    for (let i = 0; i < historyArray.length; i++) {
      const [hash] = historyArray[i].split("|");

      let found = false;

      for (let j = 0; j < currentDirHistoryArray.length; j++) {
        if (!currentDirHistoryArray[j]) {
          continue;
        }

        const [hashCur] = currentDirHistoryArray[j].split("|");

        if (makeHash(hash) === hashCur) {
          found = true;
          delete currentDirHistoryArray[j];
        }
      }

      if (!found) {
        missedArray.push(historyArray[i]);
      }
    }

    return missedArray;
  }

  function makeHash(string) {
    return crypto
      .createHmac("sha256", options.secret)
      .update(string)
      .digest("hex");
  }

  ({
    async from() {
      let lines;

      try {
        lines = findMissedCommits();
      } catch (e) {
        console.warn(
          chalk.bold.green(`No commits in current directory. Continue`)
        );
        lines = getHistory()
          .split("\n")
          .filter(x => x);
      }

      if (!lines.length) {
        console.log(chalk.bold.green(`Nothing to update. It may be ok.`));
        return;
      }

      console.log(chalk.green(`Found ${lines.length} commits`));

      const spinner = ora(`Writing history`).start();

      await lines.reduce(async (lastPromise, line) => {
        await lastPromise;

        const [hash, date] = line.split("|");

        return exec(
          `
                    echo "${makeHash(hash)}" > commit.md
                    export GIT_COMMITTER_DATE="${date}"
                    export GIT_AUTHOR_DATE="${date}"
                    git add commit.md -f
                    git commit --date="${date}" -m "${makeHash(hash)}"
                `,
          {
            encoding: "utf8"
          }
        );
      }, Promise.resolve());

      spinner.succeed();
    }
  }[command]());
};

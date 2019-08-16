const ora = require("ora");
const chalk = require("chalk");
const { execSync } = require("child_process");
const crypto = require("crypto");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const HASH_SECRET = "crypto";
const COMMANDS = ["from"];

function validationError(message) {
  console.error(chalk.bold.red(`✖ ${message}`));
  process.exit(1);
}

module.exports = function(command, source, _options) {
  const options = Object.assign(
    {
      secret: HASH_SECRET,
      author: null
    },
    _options
  );

  if (!command) {
    validationError(
      `Probably forget ${COMMANDS.map(x => `'${x}'`).join(" or ")} argument`
    );
    return;
  }
  if (!COMMANDS.includes(command)) {
    validationError(
      `Argument '${command}' does not exist. Use ${COMMANDS.map(
        x => `'${x}'`
      ).join(", ")} instead`
    );
    return;
  }
  if (!source) {
    validationError(`Probably forget to enter a path to existing repository`);
    return;
  }

  function getHistory() {
    let author = options.author;
    if (!author) {
      author = execSync(`cd ${source} && git config user.name`, {
        encoding: "utf8"
      }).replace(/\n/, "");
    }

    let authorString = `--author="${author}"`;

    if (Array.isArray(author)) {
      authorString = author.map(a => `--author="${a}"`).join(" ");
    }

    return execSync(
      `cd ${source} && git log --pretty="%H|%ad" --date=format:"%Y-%m-%d %H:%M:%S" ${authorString} --all`,
      { encoding: "utf8" }
    );
  }

  function getCurrentDirHistory() {
    let author = options.author;
    if (!author) {
      author = execSync(`git config user.name`, { encoding: "utf8" });
    }

    let authorString = `--author="${author}"`;

    if (Array.isArray(author)) {
      authorString = author.map(a => `--author="${a}"`).join(" ");
    }

    return execSync(
      `git log --pretty="%s|%ad" --date=format:"%Y-%m-%d %H:%M:%S" ${authorString} --all`,
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

      await lines.reverse().reduce(async (lastPromise, line) => {
        await lastPromise;

        const [hash, date] = line.split("|");
        const newHash = makeHash(hash);

        return exec(
          `echo "${newHash}" > commit.md && git add commit.md && git commit --date "${date}" -m "${newHash}"`,
          {
            encoding: "utf8"
          }
        );
      }, Promise.resolve());

      spinner.succeed();
    }
  }[command]());
};

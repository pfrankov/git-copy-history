const { git } = require("./git-exec");
const crypto = require("crypto");
const fs = require("fs");

const HASH_SECRET = "crypto";
const COMMANDS = ["from"];

function validationError(message) {
  console.error(`✖ ${message}`);
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
      author = git(["config", "user.name"], source).replace(/\n/, "");
    }

    const authors = Array.isArray(author) ? author : [author];
    return git(
      [
        "log",
        "--pretty=%H|%ad",
        "--date=format:%Y-%m-%d %H:%M:%S"
      ].concat(
        authors.map(name => `--author=${name}`),
        ["--all"]
      ),
      source
    );
  }

  function getCurrentDirHistory() {
    return git(["log", "--pretty=%s|%ad", "--all"]);
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
    from() {
      let lines;

      try {
        lines = findMissedCommits();
      } catch (e) {
        console.warn(`No commits in current directory. Continue`);
        lines = getHistory()
          .split("\n")
          .filter(x => x);
      }

      if (!lines.length) {
        console.log(`Nothing to update. It may be ok.`);
        return;
      }

      console.log(`Found ${lines.length} commits`);
      for (const line of lines.reverse()) {
        const [hash, date] = line.split("|");
        const newHash = makeHash(hash);
        fs.writeFileSync("commit.md", `${newHash}\n`);
        git(["add", "commit.md"]);
        git(["commit", "--date", date, "-m", newHash]);
      }
      console.log(`History updated.`);
    }
  }[command]());
};

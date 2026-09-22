const { execFileSync } = require("child_process");

function git(args, cwd) {
  const argv = cwd ? ["-C", cwd].concat(args) : args;
  return execFileSync("git", argv, { encoding: "utf8" });
}

module.exports = { git };

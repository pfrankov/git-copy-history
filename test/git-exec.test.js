const assert = require("node:assert/strict");
const { execFileSync, execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { git } = require("../git-exec");

test("git config user.name works when the repo path contains a space", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "MY PASSPORT "));
  const source = path.join(root, "Documents");
  fs.mkdirSync(source);
  const run = (args) =>
    execFileSync("git", args, { cwd: source, encoding: "utf8" });
  run(["init", "-q", "-b", "main"]);
  run(["config", "user.email", "fixture@example.com"]);
  run(["config", "user.name", "Space Name"]);
  fs.writeFileSync(path.join(source, "a.txt"), "a\n");
  run(["add", "a.txt"]);
  run(["commit", "-qm", "init"]);

  assert.throws(() => {
    execSync(`cd ${source} && git config user.name`, { encoding: "utf8" });
  });

  assert.equal(git(["config", "user.name"], source).replace(/\n/, ""), "Space Name");
  const log = git(
    ["log", "--pretty=%s", "--all"],
    source
  );
  assert.match(log, /init/);
});

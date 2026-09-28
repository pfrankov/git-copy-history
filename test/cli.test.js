const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const cli = path.join(__dirname, "..", "cli.js");

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function runCli(cwd, args) {
  return execFileSync(process.execPath, [cli].concat(args), {
    cwd,
    encoding: "utf8",
  });
}

test("copies history from a spaced path once, with repeatable authors and no shell expansion", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "git-copy-history "));
  const source = path.join(root, "source with spaces");
  const target = path.join(root, "target with spaces");
  const marker = path.join(root, "injected");

  try {
    for (const repo of [source, target]) {
      fs.mkdirSync(repo);
      git(repo, ["init", "-q"]);
      git(repo, ["config", "user.email", "fixture@example.com"]);
    }
    git(source, ["config", "user.name", "First Author"]);
    fs.writeFileSync(path.join(source, "a.txt"), "first\n");
    git(source, ["add", "a.txt"]);
    git(source, ["commit", "-qm", "first"]);
    git(source, ["config", "user.name", "Second Author"]);
    fs.writeFileSync(path.join(source, "a.txt"), "second\n");
    git(source, ["add", "a.txt"]);
    git(source, ["commit", "-qm", "second"]);
    git(target, ["config", "user.name", "Destination Author"]);

    const args = [
      "from", source,
      "--author=First Author", "--author=Second Author",
      "--secret=test secret",
    ];
    runCli(target, args);
    assert.equal(git(target, ["rev-list", "--count", "HEAD"]), "2");
    assert.match(fs.readFileSync(path.join(target, "commit.md"), "utf8"), /^[0-9a-f]{64}\n$/);

    runCli(target, args);
    assert.equal(git(target, ["rev-list", "--count", "HEAD"]), "2");

    runCli(target, ["from", source, `--author=Nobody\"; touch ${marker}; #`]);
    assert.equal(fs.existsSync(marker), false);
    assert.equal(git(target, ["rev-list", "--count", "HEAD"]), "2");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("CLI exposes help and the package version", () => {
  assert.match(runCli(process.cwd(), ["--help"]), /git-copy-history from <source>/);
  assert.equal(runCli(process.cwd(), ["--version"]).trim(), "1.2.1");
});

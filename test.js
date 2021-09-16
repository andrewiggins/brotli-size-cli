import * as fs from "fs";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { test } from "uvu";
import * as assert from "uvu/assert";
import brotliModule from "brotli-size";

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = (...args) => path.join(__dirname, ...args);
const testPath = repoRoot("test.js");

// @ts-ignore
const { fileSync } = brotliModule;

/**
 * @param {string[]} args
 * @param {string} [stdin]
 */
function runCli(args, stdin) {
	args = [repoRoot("index.js"), ...args];

	/** @type {import("child_process").SpawnSyncOptionsWithStringEncoding} */
	const options = {
		input: stdin ? stdin : undefined,
		encoding: "utf8",
	};

	const result = spawnSync(process.execPath, args, options);

	if (result.stderr) {
		throw new Error(`Process exited with non-empty stderr: "${result.stderr}"`);
	}

	if (result.status !== 0) {
		throw new Error("Process exited with non-zero status: " + result.status);
	}

	return result.stdout;
}

test("file", async () => {
	const stdout = runCli(["test.js"]);
	assert.match(stdout.trim(), /^\d+ B$/, "Outputs formatted byte count");
});

test("file raw", async () => {
	const stdout = runCli(["test.js", "--raw"]);
	assert.equal(
		parseInt(stdout, 10),
		fileSync(testPath),
		"Outputs raw byte count"
	);
});

test("stdin raw", async () => {
	const stdin = fs.readFileSync(testPath, "utf-8");
	const stdout = runCli(["--raw"], stdin);
	assert.equal(
		parseInt(stdout, 10),
		fileSync(testPath),
		"Accepts stdin stream"
	);
});

test("version", async () => {
	const pkg = JSON.parse(fs.readFileSync(repoRoot("package.json"), "utf-8"));
	const stdout = runCli(["--version"]);
	assert.equal(
		stdout.trim(),
		`brotli-size, ${pkg.version}`,
		"Version matches string in package.json"
	);
});

test.run();

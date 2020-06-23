import * as fs from "fs";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import test from "tape";
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

test("file", async (t) => {
	const stdout = runCli(["test.js"]);
	t.match(stdout.trim(), /^\d+ B$/, "Outputs formatted byte count");
});

test("file raw", async (t) => {
	const stdout = runCli(["test.js", "--raw"]);
	t.equal(parseInt(stdout, 10), fileSync(testPath), "Outputs raw byte count");
});

test("stdin raw", async (t) => {
	const stdin = fs.readFileSync(testPath, "utf-8");
	const stdout = runCli(["--raw"], stdin);
	t.equal(parseInt(stdout, 10), fileSync(testPath), "Accepts stdin stream");
});

test("version", async (t) => {
	const pkg = JSON.parse(fs.readFileSync(repoRoot("package.json"), "utf-8"));
	const stdout = runCli(["--version"]);
	t.equal(
		stdout.trim(),
		`brotli-size, ${pkg.version}`,
		"Version matches string in package.json"
	);
});

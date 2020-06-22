import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import test from "tape";

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = (...args) => path.join(__dirname, ...args);

test("main", async (t) => {
	const result = spawnSync(process.execPath, [repoRoot("index.js")], {
		encoding: "utf8",
	});

	t.equal(result.stdout, "42\n", "42 is the output");
});

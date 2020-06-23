#!/usr/bin/env node

import fs from "fs";
import { constants as brotliConstants } from "zlib";
import sade from "sade";
import prettyBytes from "pretty-bytes";
import brotliModule from "brotli-size";

sade("brotli-size [file]", true)
	.version("0.0.0")
	.describe("Get the brotli size of a file or stdin")
	.example("unicorn.png")
	.example("unicorn.png --raw")
	.option("--raw", "Display value in bytes", false)
	.option(
		"-m --mode",
		"Mode the brotli algorithm should run in. Must be one of NodeJS's zlib.constants.BROTLI_MODE_* values (e.g. 0 = DEFAULT, 1 = TEXT, 2 = FONT)",
		brotliConstants.BROTLI_DEFAULT_MODE
	)
	.option(
		"-q --quality",
		"Quality of compression. Must be between NodeJS's zlib.constants.BROTLI_MIN_QUALITY and zlib.constants.BROTLI_MAX_QUALITY. Default is MAX_QUALITY.",
		brotliConstants.BROTLI_MAX_QUALITY
	)
	.action(run)
	.parse(process.argv);

/**
 * @param {string} input
 * @param {{ mode: number; quality: number; raw: boolean }} options
 */
function run(input, options) {
	if (!input && process.stdin.isTTY) {
		console.error("Specify a file path");
		process.exit(1);
	}

	const source = input ? fs.createReadStream(input) : process.stdin;

	// @ts-ignore
	const { stream: brotliSize } = brotliModule;
	source.pipe(brotliSize(options)).on("brotli-size", (size) => {
		console.log(options.raw ? size : prettyBytes(size));
	});
}

import { execFile } from "child_process";
import { tmpdir } from "os";
import { join } from "path";

const EXTRA_PATHS = process.platform === "darwin"
	? "/usr/local/bin:/opt/homebrew/bin"
	: "/usr/local/bin";

const ENV = {
	...process.env,
	PATH: `${process.env.PATH}:${EXTRA_PATHS}`,
};

function exec(cmd: string, args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(cmd, args, { env: ENV }, (error, stdout, stderr) => {
			if (error) {
				reject(new Error(stderr || error.message));
			} else {
				resolve(stdout);
			}
		});
	});
}

export async function convertToAvif(inputPath: string, quality: number): Promise<string> {
	const outputPath = join(tmpdir(), `avify-${Date.now()}.avif`);
	await exec("magick", [inputPath, "-quality", String(quality), outputPath]);
	return outputPath;
}

export async function computeSha1(filePath: string): Promise<string> {
	const cmd = process.platform === "darwin" ? "shasum" : "sha1sum";
	const args = process.platform === "darwin" ? ["-a", "1", filePath] : [filePath];
	const stdout = await exec(cmd, args);
	const hash = stdout.trim().split(/\s+/)[0];
	if (!hash || hash.length !== 40) {
		throw new Error(`Unexpected ${cmd} output: ${stdout}`);
	}
	return hash;
}

export async function checkMagickAvailable(): Promise<boolean> {
	const cmd = process.platform === "win32" ? "where" : "which";
	try {
		await exec(cmd, ["magick"]);
		return true;
	} catch {
		return false;
	}
}

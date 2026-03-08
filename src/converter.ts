import { execFile } from "child_process";
import { tmpdir } from "os";
import { join } from "path";

const ENV = {
	...process.env,
	PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`,
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
	const stdout = await exec("shasum", ["-a", "1", filePath]);
	const hash = stdout.trim().split(/\s+/)[0];
	if (!hash || hash.length !== 40) {
		throw new Error(`Unexpected shasum output: ${stdout}`);
	}
	return hash;
}

export async function checkMagickAvailable(): Promise<boolean> {
	try {
		await exec("which", ["magick"]);
		return true;
	} catch {
		return false;
	}
}

import { Editor, MarkdownView, Notice, TFile } from "obsidian";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { computeSha1, convertToAvif } from "./converter";
import type AvifyPlugin from "./main";

const MIME_EXTENSIONS: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/gif": "gif",
	"image/bmp": "bmp",
	"image/webp": "webp",
	"image/tiff": "tiff",
	"image/svg+xml": "svg",
};

function isConvertibleImage(file: File): boolean {
	return file.type.startsWith("image/") && file.type !== "image/avif";
}

function getImageFiles(files: FileList | undefined | null): File[] {
	if (!files) return [];
	return Array.from(files).filter(isConvertibleImage);
}

async function processImage(
	plugin: AvifyPlugin,
	file: File,
	editor: Editor,
	activeFile: TFile,
): Promise<void> {
	const tempFiles: string[] = [];
	const notice = new Notice(`Avify: converting ${file.name}...`, 0);

	try {
		// Get the input path — dropped files have .path, pasted blobs don't
		let inputPath = (file as File & { path?: string }).path;

		if (!inputPath) {
			const ext = MIME_EXTENSIONS[file.type] ?? "png";
			inputPath = join(tmpdir(), `avify-input-${Date.now()}.${ext}`);
			const buffer = Buffer.from(await file.arrayBuffer());
			await writeFile(inputPath, buffer);
			tempFiles.push(inputPath);
		}

		const avifPath = await convertToAvif(inputPath, plugin.settings.quality);
		tempFiles.push(avifPath);

		const hash = await computeSha1(avifPath);
		const destRelative = `${plugin.settings.assetsFolder}/${hash}.avif`;

		const adapter = plugin.app.vault.adapter;

		if (!(await adapter.exists(plugin.settings.assetsFolder))) {
			await adapter.mkdir(plugin.settings.assetsFolder);
		}

		if (!(await adapter.exists(destRelative))) {
			const data = await readFile(avifPath);
			await adapter.writeBinary(destRelative, data.buffer as ArrayBuffer);
		}

		// Need to get TFile reference — the file may have just been created
		const tfile = plugin.app.vault.getFileByPath(destRelative);
		if (!tfile) {
			new Notice("Avify: failed to locate converted file in vault");
			return;
		}

		const link = plugin.app.fileManager.generateMarkdownLink(
			tfile,
			activeFile.path,
		);
		const embed = link.startsWith("!") ? link : `!${link}`;
		editor.replaceSelection(embed);
		notice.setMessage(`Avify: converted ${file.name}`);
		setTimeout(() => notice.hide(), 3000);
	} catch (e) {
		notice.hide();
		const msg = e instanceof Error ? e.message : String(e);
		new Notice(`Avify: conversion failed — ${msg}`);
	} finally {
		for (const tmp of tempFiles) {
			try {
				await unlink(tmp);
			} catch {
				// ignore cleanup errors
			}
		}
	}
}

async function handleImages(
	plugin: AvifyPlugin,
	files: File[],
	editor: Editor,
	view: MarkdownView,
): Promise<void> {
	const activeFile = view.file;
	if (!activeFile) return;

	for (const file of files) {
		await processImage(plugin, file, editor, activeFile);
	}
}

export function registerHandler(plugin: AvifyPlugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on("editor-drop", (evt: DragEvent, editor: Editor, view: MarkdownView) => {
			if (!plugin.settings.enabled || !plugin.magickAvailable) return;

			const images = getImageFiles(evt.dataTransfer?.files);
			if (images.length === 0) return;

			evt.preventDefault();
			handleImages(plugin, images, editor, view);
		}),
	);

	plugin.registerEvent(
		plugin.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor, view: MarkdownView) => {
			if (!plugin.settings.enabled || !plugin.magickAvailable) return;

			const images = getImageFiles(evt.clipboardData?.files);
			if (images.length === 0) return;

			evt.preventDefault();
			handleImages(plugin, images, editor, view);
		}),
	);
}

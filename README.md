# Avify

Obsidian plugin that automatically converts dropped and pasted images to AVIF format. Images are deduplicated by content hash and stored in a configurable assets folder.

## Requirements

- [ImageMagick](https://imagemagick.org/) must be installed and available in PATH
  - **macOS:** `brew install imagemagick`
  - **Linux:** `sudo apt install imagemagick` (or equivalent for your distro)

## Installation

### BRAT (recommended for beta testing)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Open BRAT settings and click **Add Beta Plugin**
3. Enter `asiryk/avify` and click **Add Plugin**
4. Enable **Avify** in Settings → Community Plugins

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/asiryk/avify/releases/latest)
2. Create a folder `avify` inside your vault's `.obsidian/plugins/` directory
3. Place the downloaded files into that folder
4. Enable **Avify** in Settings → Community Plugins

## How it works

1. Intercepts image drag-and-drop and paste events in the editor
2. Converts the image to AVIF using ImageMagick
3. Names the output file by its SHA-1 hash for deduplication
4. Stores the result in the configured assets folder
5. Inserts a markdown embed link at the cursor position

## Settings

| Setting       | Default  | Description                                |
| ------------- | -------- | ------------------------------------------ |
| Enabled       | `true`   | Toggle automatic image conversion          |
| Assets folder | `Assets` | Folder where converted AVIF images go      |
| Quality       | `85`     | AVIF compression quality (1–100)           |

# Avify

Obsidian plugin that automatically converts images to AVIF format when you drop or paste them into the editor.

## What it does

1. Intercepts image drag-and-drop and paste (Cmd+V) events in the editor
2. Converts the image to AVIF using ImageMagick (`magick input -quality 85 output.avif`)
3. Names the output file by its SHA1 hash for deduplication
4. Stores the result in the `Assets/` folder
5. Inserts a markdown link pointing to the converted file

Dropping the same image twice produces the same hash, so duplicates are avoided automatically.

## Requirements

- **macOS** (desktop only)
- [ImageMagick](https://imagemagick.org/) installed and available in PATH:
  ```
  brew install imagemagick
  ```

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Enabled | `true` | Toggle automatic conversion on/off |
| Assets folder | `Assets` | Vault folder where converted images are stored |
| Quality | `85` | AVIF compression quality (1–100) |

## Installation

1. Build the plugin: `npm install && npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to `<vault>/.obsidian/plugins/avify/`
3. Enable **Avify** in **Settings → Community plugins**

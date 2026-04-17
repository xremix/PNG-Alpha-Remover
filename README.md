# PNG Alpha Remover

![PNG Alpha Remover Screenshot](screenshot.png)

PNG Alpha Remover is a lightweight frontend tool that processes PNG files locally in the browser.
This repository provides a drag-and-drop interface, removes the alpha channel from each PNG file, and automatically downloads the processed results.

[Use PNG Alpha Remover](https://rawcdn.githack.com/xremix/PNG-Alpha-Remover/faf44276c36b2e887296cd3513ad2a83c94539bd/png-alpha-remover.html)

## What This Repository Does

- Provides a modern drag-and-drop upload area
- Accepts multiple files at once
- Validates type and extension (PNG files only)
- Converts transparent pixels to fully opaque pixels on a white background
- Downloads each processed file with its original filename
- Shows live status for processed, skipped, and failed files

## How It Works Technically

- `png-alpha-remover.html` contains the app structure
- `styles.css` contains all styling
- `main.js` processes files in the browser via Canvas:
	- The image is loaded
	- Pixel data is read
	- RGB channels are blended over white based on alpha values
	- Alpha is forced to `255`
	- The result is exported as PNG and downloaded

## Why It Runs Locally

All processing runs client-side in the browser. No files are uploaded to a server, which keeps the workflow fast and privacy-friendly.

## Usage

1. Open `png-alpha-remover.html` in your browser.
2. Drag PNG files into the drop area or click to select files.
3. Downloads start automatically after processing.
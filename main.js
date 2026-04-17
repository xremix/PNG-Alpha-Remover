const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const statusChip = document.getElementById("statusChip");
const countChip = document.getElementById("countChip");
const skipChip = document.getElementById("skipChip");
const errorChip = document.getElementById("errorChip");
const resultList = document.getElementById("resultList");

const counters = {
    processed: 0,
    skipped: 0,
    errors: 0,
};

["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add("dragging");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove("dragging");
    });
});

dropZone.addEventListener("drop", async (event) => {
    const files = Array.from(event.dataTransfer?.files || []);
    await processFiles(files);
});

fileInput.addEventListener("change", async () => {
    const files = Array.from(fileInput.files || []);
    await processFiles(files);
    fileInput.value = "";
});

function updateChips(message) {
    statusChip.textContent = message;
    countChip.textContent = `Processed: ${counters.processed}`;
    skipChip.textContent = `Skipped: ${counters.skipped}`;

    if (counters.errors > 0) {
        errorChip.hidden = false;
        errorChip.textContent = `Errors: ${counters.errors}`;
    } else {
        errorChip.hidden = true;
    }
}

function addListItem(name, state) {
    resultList.hidden = false;
    const item = document.createElement("div");
    item.className = "list-item";

    const fileName = document.createElement("span");
    fileName.className = "name";
    fileName.textContent = name;

    const badge = document.createElement("span");
    badge.className = "badge";
    if (state === "Skipped") badge.classList.add("skipped");
    if (state === "Error") badge.classList.add("error");
    badge.textContent = state;

    item.append(fileName, badge);
    resultList.prepend(item);
}

async function processFiles(files) {
    if (files.length === 0) {
        return;
    }

    updateChips(`Processing ${files.length} file(s)...`);

    for (const file of files) {
        if (!isPng(file)) {
            counters.skipped += 1;
            addListItem(file.name, "Skipped");
            continue;
        }

        try {
            const blob = await removeAlpha(file);
            downloadBlob(blob, file.name);
            counters.processed += 1;
            addListItem(file.name, "Downloaded");
        } catch (error) {
            counters.errors += 1;
            addListItem(file.name, "Error");
            console.error(`Failed to process ${file.name}`, error);
        }
    }

    updateChips("Done. Drop more files anytime.");
}

function isPng(file) {
    const typeMatch = file.type.toLowerCase() === "image/png";
    const nameMatch = file.name.toLowerCase().endsWith(".png");
    return typeMatch || nameMatch;
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not read image"));
        image.src = URL.createObjectURL(file);
    });
}

async function removeAlpha(file) {
    const image = await loadImage(file);

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
        throw new Error("Canvas 2D context not supported");
    }

    ctx.drawImage(image, 0, 0);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = frame.data;

    // Blend pixels over white and force full opacity.
    for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3] / 255;
        pixels[i] = Math.round((pixels[i] * alpha) + (255 * (1 - alpha)));
        pixels[i + 1] = Math.round((pixels[i + 1] * alpha) + (255 * (1 - alpha)));
        pixels[i + 2] = Math.round((pixels[i + 2] * alpha) + (255 * (1 - alpha)));
        pixels[i + 3] = 255;
    }

    ctx.putImageData(frame, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("PNG export failed"));
                return;
            }
            resolve(blob);
        }, "image/png");
    });
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
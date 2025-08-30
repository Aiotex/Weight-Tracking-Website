import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { IMG_UPLOAD_DIR } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Ensure a directory exists, create if missing */
export function ensureDirExists(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

/** Returns the relative path for an uploaded image */
export function getImgPath(filename) {
	return path.join(IMG_UPLOAD_DIR, filename);
}

/** Returns the absolute path for an uploaded image */
export function getImgFullPath(filename) {
	// Get the src directory and join with IMG_UPLOAD_DIR
	const srcDir = path.resolve(__dirname, '..');
	return path.join(srcDir, IMG_UPLOAD_DIR, filename);
}

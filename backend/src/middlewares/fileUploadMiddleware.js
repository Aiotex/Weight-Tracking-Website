import multer from 'multer';
import path from 'path';
import { ensureDirExists, getImgFullPath } from '../utils/fileUtils.js';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = getImgFullPath('');
		ensureDirExists(uploadDir);
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
	},
});

const upload = multer({ storage });

export default upload;

import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/routes.js';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorHandler.js';
import HttpException from './utils/httpException.js';
import path from 'path';
import cors from 'cors';
import { IMG_UPLOAD_DIR } from './constants.js';
import { getImgFullPath, getImgPath } from './utils/fileUtils.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'production';
const CORS_OPTIONS = { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true };

app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(routes);

app.use('/images', express.static(getImgFullPath('')));

app.get('/', (req, res) => {
	res.json({ status: 'API is running on /api' });
});

// Catch-all 404 handler for undefined routes
app.use((req, res, next) => {
	throw new HttpException(404);
});

app.use(errorHandler);
//app.use(express.static(__dirname + '/assets'))

app.listen(PORT, () => {
	console.log(`[${HOST}] Server listening on port: ${PORT}`);
	console.log(`[DIR] Image uploads directory: ${getImgPath('')}`);
	console.log(`[DIR] Serving images from: ${getImgFullPath('')}`);
	console.log('[environment]', NODE_ENV);
});

//TODO: change token expiration times in production
//TODO: add logger in the utils
//TODO: add a code error msg assoieted with the httpExeption for more context when logging errors
//TODO: add error logging on disk
//TODO: write project in typescript
//TODO: add tests with jest
//TODO: global response formatting / just use graphQL
//TODO: add rate limiting
//TODO: accept form data

//TODO: look at morgan module for logging
//TODO: look at helmet module for security
//TODO: look at debuggers

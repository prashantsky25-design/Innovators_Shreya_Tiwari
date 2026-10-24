import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';

// Ensure base upload folders exist
const uploadDirs = ['covers', 'certificates', 'photos', 'avatars'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(config.uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'photos';
    if (file.fieldname === 'cover') folder = 'covers';
    else if (file.fieldname === 'avatar') folder = 'avatars';
    else if (file.fieldname === 'certificate') folder = 'certificates';
    cb(null, path.join(config.uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, PNG, WEBP, and SVG image files are allowed'));
  },
});

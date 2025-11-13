import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as fsp from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, "../uploads/products");

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, uploadPath);
  // },

  destination: (req, file, cb) => {
    if (file.fieldname === "product_image") {
      cb(null, 'uploads/products');
    } else if (file.fieldname === "banner") {
      cb(null, 'uploads/banners');
    } else {
      cb(new Error(`Invalid field name: ${file.fieldname}`), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};


export async function deleteFiles(filePaths) {
  const deletePromises = filePaths.map(async (filePath) => {
    if (!filePath) return;

    try {
      const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const fullPath = path.join(process.cwd(), 'uploads', relativePath.split('/').slice(1).join('/'));

      try {
        await fsp.access(fullPath);
        await fsp.unlink(fullPath);
        console.log('File deleted successfully:', fullPath);
      } catch (accessError) {
        if (accessError.code === 'ENOENT') {
          console.log('File not found, already deleted:', fullPath);
        } else {
          throw accessError;
        }
      }
    } catch (error) {
      console.error('Error deleting file:', filePath, error.message);
    }
  });

  await Promise.allSettled(deletePromises);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

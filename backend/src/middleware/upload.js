const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { BadRequestError } = require("../utils/errors");

// Helper to resolve and create uploads subfolders
const getUploadPath = (subfolder) => {
  const rootUploads = path.join(__dirname, "../../uploads");
  const targetDir = path.join(rootUploads, subfolder || "documents");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Read category/subfolder from body or query, default to "documents"
    const subfolder = req.body.category || req.query.category || "employees";
    const allowedSubfolders = ["employees", "documents", "certificates", "assets"];
    const folder = allowedSubfolders.includes(subfolder) ? subfolder : "documents";
    
    cb(null, getUploadPath(folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(mime)) {
    return cb(new BadRequestError("Invalid file type. Only JPG, PNG, and PDF are allowed."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;

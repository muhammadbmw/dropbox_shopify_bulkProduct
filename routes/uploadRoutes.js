const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  uploadFile,
  uploadErrorHandler,
} = require("../controllers/uploadController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({
  storage,
});

// Route to handle file upload
router.post("/", upload.single("file"), uploadFile);

// Error handling middleware
router.use(uploadErrorHandler);

module.exports = router;

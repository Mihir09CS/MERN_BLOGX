const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile } = require("../controllers/uploadController");
const { protectUser } = require("../middlewares/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protectUser, upload.single("file"), uploadFile);

module.exports = router;

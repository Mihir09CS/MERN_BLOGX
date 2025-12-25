const imagekit = require("../utils/imageKit");
const asyncHandler = require("express-async-handler");

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const result = await imagekit.upload({
    file: req.file.buffer.toString("base64"),
    fileName: `${Date.now()}-${req.file.originalname}`,
    folder:
      req.query.type === "profile"
        ? "/profiles"
        : req.query.type === "blog"
        ? "/blogs"
        : "/others",
  });

  res.status(201).json({
    success: true,
    url: result.url,
    fileId: result.fileId,
  });
});

module.exports = { uploadFile };

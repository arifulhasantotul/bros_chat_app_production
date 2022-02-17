const multer = require("multer");
const createError = require("http-errors");
const accountStorage = require("../config/cloudniaryAccountStorage");

const uploader = (allowed_file_types, max_file_size, error_msg) => {
  // prepare the final multer upload object
  const upload = multer({
    storage: accountStorage,
    limits: {
      fileSize: max_file_size,
    },
    fileFilter: (req, file, cb) => {
      if (allowed_file_types.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError(error_msg), false);
      }
    },
  });

  return upload;
};

module.exports = uploader;

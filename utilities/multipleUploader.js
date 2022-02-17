// external imports
const multer = require("multer");
const createError = require("http-errors");
const accountStorage = require("../config/cloudniaryAccountStorage");

const multipleUploader = (
  allowed_file_types,
  max_file_size,
  max_number_of_upload_files,
  error_msg
) => {
  // prepare final multer upload object
  const upload = multer({
    storage: accountStorage,
    limits: {
      fileSize: max_file_size,
    },
    fileFilter: (req, file, cb) => {
      if (req.files.length > max_number_of_upload_files) {
        cb(
          createError(
            `Maximum ${max_number_of_upload_files} files are allowed to upload!`
          )
        );
      } else {
        if (allowed_file_types.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(createError(error_msg));
        }
      }
    },
  });

  return upload;
};

// export module
module.exports = multipleUploader;

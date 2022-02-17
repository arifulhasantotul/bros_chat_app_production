// internal imports
const multipleUploader = require("../../utilities/multipleUploader");

function attachmentUpload(req, res, next) {
  const upload = multipleUploader(
    ["image/jpeg", "image/jpg", "image/png"],
    25000000,
    10,
    "Only .jpeg, .jpg or .png format allowed!"
  );

  // call the middleware function
  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

// export module
module.exports = attachmentUpload;

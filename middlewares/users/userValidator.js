// external imports
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const path = require("path");
const { unlink } = require("fs");

// internal imports
const User = require("../../models/People");

// add user validator
const addUserValidators = [
  // name validation
  check("name")
    .isLength({ min: 3 })
    .withMessage("Name with at least 3 characters is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must not contain anything other than alphabet")
    .trim(),
  // email validation
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw createError("Email already in use!");
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),
  // mobile validation
  check("mobile")
    .isMobilePhone("bn-BD", {
      strictMode: true,
    })
    .withMessage(
      "Mobile must be a valid Bangladeshi number or use country code before number"
    )
    .custom(async (value) => {
      try {
        const user = await User.findOne({ mobile: value });
        if (user) {
          throw createError("Mobile number is already in use!");
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),
  // password validation
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol"
    ),
];

// validators handler
const addUserValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // check uploaded files
    if (req.files.length > 0) {
      console.log(req.files[0]);
    }

    // response the errors
    res.status(500).json({
      errors: mappedErrors,
    });
  }
};

// export module
module.exports = { addUserValidators, addUserValidationHandler };

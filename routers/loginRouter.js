/*
 * Title: Project Login Router
 * Description: Handling login routing
 * Author: MD ARIFUL HASAN
 * Date: 19/01/2022
 *
 */

// external imports
const express = require("express");

// internal imports
const decorateHTMLResponse = require("../middlewares/common/decorateHTMLResponse");
const { getLogin, login, logout } = require("../controllers/loginController");
const { redirectLoggedIn } = require("../middlewares/common/checkLogin");
const {
  doLoginValidators,
  doLoginValidationHandler,
} = require("../middlewares/login/loginValidators");

const router = express.Router();

// set page title
const page_title = "Login";

// GET: login page
router.get("/", decorateHTMLResponse(page_title), redirectLoggedIn, getLogin);

// POST: process login
router.post(
  "/",
  decorateHTMLResponse(page_title),
  doLoginValidators,
  doLoginValidationHandler,
  login
);

// DELETE: logout
router.delete("/", logout);

// module export
module.exports = router;

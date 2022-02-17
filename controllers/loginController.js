/*
 * Title: Project Login Control
 * Description: Handling login controller functions
 * Author: MD ARIFUL HASAN
 * Date: 20/01/2022
 *
 */

// external imports
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

// internal imports
const User = require("../models/People");

// go to login page
function getLogin(req, res, next) {
  res.render("login");
}

// login
async function login(req, res, next) {
  try {
    // match user email/mobile data to db
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });

    if (user && user._id) {
      // check password validation
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (isValidPassword) {
        // create user object to generate token
        const userObject = {
          userId: user._id,
          username: user.name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || "User",
        };

        // generate token for cookies
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        // res cookies
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });

        // set logged in user to local variable
        res.locals.loggedInUser = userObject;

        // redirect to inbox page
        res.redirect("inbox");
      } else {
        throw createError("Login failed.Please try again");
      }
    } else {
      throw createError("Login failed.Please try again");
    }
  } catch (err) {
    res.render("login", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// logout
function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.send("logged out");
}

// module exports
module.exports = { getLogin, login, logout };

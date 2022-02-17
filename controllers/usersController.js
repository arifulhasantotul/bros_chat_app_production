/*
 * Title: Project User Control
 * Description: Handling all user controller function
 * Author: MD ARIFUL HASAN
 * Date: 22/01/2022
 *
 */

// external imports
const { hash } = require("bcrypt");
const cloudinary = require("../config/cloudinary");

// internal imports
const User = require("../models/People");

// get users page
async function getUsers(req, res, next) {
  try {
    const allUsers = await User.find();
    res.render("users", {
      users: allUsers,
    });
  } catch (err) {
    next(err);
  }
}

// add user
async function addUser(req, res, next) {
  let newUser;
  const saltRound = 10;

  // hashing password using bcrypt
  const hashedPassword = await hash(req.body.password, saltRound);
  try {
    // checking avatar/files
    if (req.files && req.files.length > 0) {
      // setting cloudinary
      const result = await cloudinary.uploader.upload(req.files[0].path, {
        width: 200,
        height: 200,
        crop: "thumb",
        gravity: "face",
      });
      newUser = new User({
        ...req.body,
        avatar: result.secure_url,
        password: hashedPassword,
        cloudinary_id: result.public_id,
      });
    } else {
      newUser = new User({
        ...req.body,
        password: hashedPassword,
      });
    }

    // save user
    await newUser.save();
    res.status(200).json({
      message: "User added successfully!",
    });
  } catch (err) {
    // send error
    res.status(500).json({
      errors: {
        common: {
          msg: "Couldn't add user!",
        },
      },
    });
  }
}

// update user
// this function is not checked whether it works or not
async function updateUser(req, res, next) {
  const saltRound = 10;

  // hashing password using bcrypt
  const hashedPassword = await hash(req.body.password, saltRound);
  try {
    let oldUser = await User.findById(req.params.id);
    if (oldUser.avatar && oldUser.cloudinary_id) {
      // delete image from cloudinary
      await cloudinary.uploader.destroy(oldUser.cloudinary_id);
    }
    // checking avatar/files
    if (req.files && req.files.length > 0) {
      // setting cloudinary
      const result = await cloudinary.uploader.upload(req.files[0].path, {
        width: 200,
        height: 200,
        crop: "thumb",
        gravity: "face",
      });
      const updateUser = {
        name: req.body.name || oldUser.name,
        email: req.body.email || oldUser.email,
        mobile: req.body.mobile || oldUser.mobile,
        password: hashedPassword || oldUser.password,
        avatar: result.secure_url || oldUser.avatar,
        cloudinary_id: result.public_id || oldUser.cloudinary_id,
      };
    } else {
      const updateUser = {
        name: req.body.name || oldUser.name,
        email: req.body.email || oldUser.email,
        mobile: req.body.mobile || oldUser.mobile,
        password: hashedPassword || oldUser.password,
      };
    }

    // save user
    oldUser = await User.findByIdAndUpdate(req.params.id, updateUser, {
      new: true,
    });
    res.status(200).json({
      message: "User updated successfully!",
    });
  } catch (err) {
    // send error
    res.status(500).json({
      errors: {
        common: {
          msg: "Couldn't update user!",
        },
      },
    });
  }
}

// remove user
async function removeUser(req, res, next) {
  try {
    // find user by id
    const user = await User.findById(req.params.id);

    if (user.avatar && user.cloudinary_id) {
      // delete image from cloudinary
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }
    // delete user from db
    await user.remove();

    res.status(200).json({
      message: "User removed Successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete the user!",
        },
      },
    });
  }
}

// change user role
async function changeUserRole(req, res, next) {
  try {
    const role = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: role },
      { new: true, upsert: true, useFindAndModify: false }
    );

    res.status(200).json({
      message: "User role changed successfully!",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Couldn't changed the user role!",
        },
      },
    });
  }
}

// exports functions
module.exports = { getUsers, addUser, updateUser, removeUser, changeUserRole };

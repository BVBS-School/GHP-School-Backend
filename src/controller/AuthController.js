const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../db/User');
const { promisify } = require('util');

exports.verifyToken = async (req, res, next) => {
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    let token = authHeader.split(" ")[1];
    if (!token) {
      res.status(400).json({
        status: false,
        message: "User is not authorized or Token is missing",
      });
    } else {
      try {
        const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
        if (decode) {
          let result = await User.findById(decode.id);
          req.user = result;
          next();
        } else {
          res.status(401).json({
            status: false,
            message: 'Uauthorized',
          })
        }
      } catch (err) {
        console.log("err", err)
        res.status(401).json({
          status: false,
          message: 'Invalid or expired token',
          error: err
        });
      }
    }
  } else {
    res.status(401).json({
      status: false,
      message: 'Unauthorized: Missing Token',
    });
  }
};

const signToken = async (id) => {
  const token = jwt.sign(
    { id },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '14400m' }
  );
  return token
}

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({
      status: false,
      message: "Email and password are required!",
    });
  }

  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid Email or password",
      });
    }
    const token = await signToken(user._id)
    res.json({
      status: true,
      message: "Login Successfully!",
      token,
    });
  } catch (err) {
    console.error("DB Login Error:", err.message);
    return res.status(500).json({
      status: false,
      message: "An error occurred while logging in. Please check your credentials.",
    });
  }
});

exports.signup = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  let isAlready = await User.findOne({ email });
  if (isAlready) {
    return res.status(200).json({
      status: false,
      message: "User already exists!",
    });
  }
  const record = new User({
    email,
    password,
  });
  const result = await record.save();
  if (result) {
    res.json({
      status: true,
      message: "You have been registered successfully !!.",
    });
  } else {
    res.json({
      status: false,
      error: result,
      message: "Failed to create user.",
    });
  }
});

exports.profile = catchAsync(async (req, res) => {
  if (req.user) {
    res.json({
      status: true,
      data: req.user, // Match frontend AdminLayout.js line 18
    });
  } else {
    res.status(401).json({
      status: false,
      message: "User not found",
    });
  }
});
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys"); // Import keys (including JWT secret)
const passport = require("passport");
const multer = require("multer");
const path = require("path");

// Load User model
const User = require("../../models/User");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    Login user and return JWT token
// @access  Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log('Login attempt for email:', email);

  User.findOne({ email }).then(user => {
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    console.log('User found, comparing password');
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        console.log('Password match, generating token');
        const payload = {
          id: user.id,
          name: user.name
        };

        jwt.sign(
          payload,
          require("../../config/keys").secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            if (err) {
              console.error('Error generating token:', err);
              return res.status(500).json({ error: "Error generating token" });
            }
            console.log('Token generated successfully');
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        console.log('Password mismatch for user:', email);
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  }).catch(err => {
    console.error('Database error during login:', err);
    res.status(500).json({ error: "Database error" });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    });
  }
);

// @route   POST api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post(
  "/avatar",
  passport.authenticate("jwt", { session: false }),
  upload.single('avatar'),
  (req, res) => {
    User.findById(req.user.id).then(user => {
      user.avatar = req.file.path;
      user.save().then(user => res.json(user));
    });
  }
);

// @route   GET api/users/search
// @desc    Search for users by username
// @access  Public (Consider protecting this route in a real application)
router.get('/search', (req, res) => {
  const { username } = req.query;
  console.log("Search term:", username); // Add this line

  // Use a case-insensitive regular expression to find users matching the username
  User.find({ username: { $regex: username, $options: 'i' } })
    .then(users => {
      // Filter the user data to only return necessary information (avoid sending passwords)
      const filteredUsers = users.map(user => {
        return {
          id: user.id,
          username: user.username,
          name: user.name
        };
      });
      res.json(filteredUsers); // Send the filtered user data as a JSON response
    })
    .catch(err => {
      console.error(err); // Log the error
      res.status(404).json({ usernotfound: 'No users found with that username' });
    }); // Handle errors
});

module.exports = router;
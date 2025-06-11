const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");
const path = require("path");

// Load Message model
const Message = require("../../models/Message");

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

// @route   GET api/messages/:userId
// @desc    Get messages between current user and another user
// @access  Private
router.get(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
      .sort({ date: 1 })
      .then(messages => res.json(messages))
      .catch(err => res.status(400).json(err));
  }
);

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single('file'),
  (req, res) => {
    const newMessage = new Message({
      sender: req.user.id,
      receiver: req.body.receiverId,
      content: req.body.content,
      fileUrl: req.file ? req.file.path : null,
      fileType: req.file ? req.file.mimetype : null
    });

    newMessage
      .save()
      .then(message => {
        req.io.to(req.body.receiverId).emit('receiveMessage', message);
        res.json(message);
      })
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router; 
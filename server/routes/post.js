const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const { check, validationResult } = require('express-validator');

const Post = mongoose.model('Post');

router.get('/allpost', (req, res) => {
  Post.find()
    .populate('postedBy', '_id name')
    .then((posts) => res.json({ posts }))
    .catch((err) => console.log(err));
});

router.post(
  '/createpost',
  [
    requireLogin,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('body', 'Bdoy is required').not().isEmpty(),
    ],
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, body } = req.body;
    req.user.password = undefined;
    const post = new Post({
      title,
      body,
      postedBy: req.user,
    });
    post
      .save()
      .then((result) => {
        res.json({ post: result });
      })
      .catch((err) => console.log(err));
  }
);

router.get('/mypost', requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate('postedBy', '_id name')
    .then((mypost) => {
      res.json({ mypost });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;

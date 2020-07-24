const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../Keys');
const requireLogin = require('../middleware/requireLogin');

const User = mongoose.model('User');

router.get('/protected', requireLogin, (req, res) => {
  res.send('hello user');
  console.log(req.user);
});

router.post(
  '/signup',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res
            .status(422)
            .json({ error: 'user already exists with that email' });
        }
        bcrypt.hash(password, 12).then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            name,
          });
          user
            .save()
            .then((user) => res.json({ message: 'saved successfully' }))
            .catch((err) => console.log(err));
        });
      })
      .catch((err) => console.log(err));
  }
);

router.post(
  '/signin',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    User.findOne({ email }).then((savedUser) => {
      if (!User) {
        return res.status(422).json({ error: 'Invalid Credentials' });
      }
      bcrypt
        .compare(password, savedUser.password)
        .then((doMatch) => {
          if (doMatch) {
            // res.json({ message: 'successfully signed in' });
            const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
            res.json({ token });
          } else return res.status(422).json({ error: 'Invalid Credentials' });
        })
        .catch((err) => console.log(err));
    });
  }
);
module.exports = router;

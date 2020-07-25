const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../Keys");
const requireLogin = require("../middleware/requireLogin");

const User = mongoose.model("User");

router.get("/protected", requireLogin, (req, res) => {
  res.send("hello user");
  console.log(req.user);
});

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: "please add all the fields" });
  }

  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "user already exists with that email" });
      }
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          email,
          password: hashedPassword,
          name,
        });
        user
          .save()
          .then((user) => res.json({ message: "saved successfully" }))
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => console.log(err));
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "please add email or password" });
  }

  User.findOne({ email }).then((savedUser) => {
    if (!User) {
      return res.status(422).json({ error: "Invalid Credentials" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          // res.json({ message: 'successfully signed in' });
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          res.json({ token });
        } else return res.status(422).json({ error: "Invalid Credentials" });
      })
      .catch((err) => console.log(err));
  });
});
module.exports = router;

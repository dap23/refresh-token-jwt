const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logger } = require("./middleware/logEvents");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Error
const error = (req, res) => {
  return res.status(500).json({ message: "Internal Server Error" });
};

// Jwt Env
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// controllers & routes
app.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);
  try {
    const user = await User.create({ ...req.body, password: hash });
    res.status(201).json(user);
  } catch (err) {
    error();
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.sendStatus(404);

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.sendStatus(404);

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      ACCESS_TOKEN,
      {
        expiresIn: "1m",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      REFRESH_TOKEN,
      { expiresIn: "1d" }
    );

    user.refreshToken.push(refreshToken);
    await user.save();

    const { password, ...basic } = user._doc;

    res.cookie("token", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ accessToken: accessToken, user: { ...basic } });
  } catch (err) {
    error();
  }
});

app.get("/logout", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.sendStatus(204); //No content
  const refreshToken = cookies.token;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
});

app.get("/refresh", async (req, res) => {
  const oldRefreshToken = req.cookies.token;
  if (!oldRefreshToken) return res.sendStatus(401);

  res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });

  const user = await User.findOne({ refreshToken: oldRefreshToken }).exec();

  console.log(user);

  if (!user) {
    jwt.verify(oldRefreshToken, REFRESH_TOKEN, async (err, decoded) => {
      if (err) return res.sendStatus(403);

      const hackedUser = await User.findOne({
        username: decoded.username,
      }).exec();
      hackedUser.refreshToken = [];
      await hackedUser.save();
    });
    return res.sendStatus(403);
  }

  const newRefreshTokenArray = user.refreshToken.filter(
    (rt) => rt !== oldRefreshToken
  );

  jwt.verify(oldRefreshToken, REFRESH_TOKEN, async (err, decoded) => {
    if (err) {
      user.refreshToken = [...newRefreshTokenArray];
      await user.save();
    }
    if (err || user.username !== decoded.username) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      ACCESS_TOKEN,
      { expiresIn: "1m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, username: user.username },
      REFRESH_TOKEN,
      { expiresIn: "1d" }
    );

    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();

    res.cookie("token", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 100,
    });

    res.json({ accessToken: newAccessToken });
  });
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    error();
  }
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`connected to port ${PORT}`));
  })
  .catch((e) => console.log(e));

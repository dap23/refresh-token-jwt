const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const createError = require("../utils/createError");

const handleRegister = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);
  try {
    const user = await User.create({ ...req.body, password: hash });
    res.status(201).json({
      message: `Account ${user.username} has been created!`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const handleLogin = async (req, res, next) => {
  const cookie = req.cookies;
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "Wrong Credentials!"));

    const match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
      const roles_user = Object.values(user.roles).filter(Boolean);

      const accessToken = jwt.sign(
        {
          username: user.username,
          roles: roles_user,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "1m" }
      );

      const newRefreshToken = jwt.sign(
        {
          username: user.username,
          roles: roles_user,
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: "1d" }
      );

      let newRefreshTokenArray = !cookie?.token
        ? user.refreshToken
        : user.refreshToken.filter((rt) => rt !== cookie.token);

      if (cookie) {
        const refreshToken = cookie.token;
        const foundToken = await User.findOne({ refreshToken }).exec();
        if (!foundToken) {
          newRefreshTokenArray = [];
        }

        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      }

      user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await user.save();

      const { password, roles, refreshToken, ...basics } = user._doc;

      res.cookie("token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ accessToken: accessToken, user: { ...basics } });
    } else {
      return next(createError(404, "Wrong Credentials"));
    }
  } catch (error) {
    next(error);
  }
};

const handleRefresh = async (req, res, next) => {
  const cookies = req.cookies;
  try {
    if (!cookies?.token)
      return next(createError(401, "You are not authenticated!"));

    const newRefreshToken = cookies.token;
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const user = await User.findOne({ refreshToken: newRefreshToken }).exec();

    if (!user) {
      jwt.verify(
        newRefreshToken,
        process.env.REFRESH_TOKEN,
        async (err, decoded) => {
          if (err) return next(createError(403, "Token is not valid"));

          const hackedUser = await User.findOne({
            username: decoded.username,
          }).exec();
          hackedUser.refreshToken = [];
          await hackedUser.save();
        }
      );
      return next(createError(403, "Token is not valid"));
    }

    const newRefreshTokenArray = user.refreshToken.filter(
      (rt) => rt !== newRefreshToken
    );

    jwt.verify(
      newRefreshToken,
      process.env.REFRESH_TOKEN,
      async (err, decoded) => {
        if (err) {
          user.refreshToken = [...newRefreshTokenArray];
          await user.save();
        }
        if (err || user.username !== decoded.username)
          return next(createError(403, "Token is not valid"));

        const roles_user = Object.values(user.roles);
        const accessToken = jwt.sign(
          {
            username: user.username,
            roles: roles_user,
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: "1m" }
        );

        const newRefreshToken = jwt.sign(
          {
            username: user.username,
            roles: roles_user,
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: "1m" }
        );

        user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await user.save();

        const { password, refreshToken, roles, ...basics } = user._doc;

        res.cookie("token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({
          accessToken: accessToken,
          user: { ...basics },
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.token) return res.sendStatus(204); //No content
  const refreshToken = cookies.token;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  const result = await foundUser.save();

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.sendStatus(204);
};

module.exports = {
  handleLogin,
  handleRegister,
  handleRefresh,
  handleLogout,
};

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const createToken = (_id, expiresIn) => {
  return jwt.sign({ _id }, process.env.SECRET, expiresIn && { expiresIn });
};

const login = async (req, res) => {
  const { username, password, remember } = req.body;

  try {
    const user = await User.login(username, password);

    const token = createToken(user._id, !remember && '24h');

    res.status(200).json({
      username: user.username,
      email: user.email,
      lastUpdated: user.updatedAt,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const signup = async (req, res) => {
  const { username, email, password, remember } = req.body;

  try {
    const user = await User.signup(username, email, password);

    const token = createToken(user._id, !remember && '24h');

    res.status(200).json({
      username: user.username,
      email: user.email,
      lastUpdated: user.updatedAt,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAvatar = async (req, res) => {
  const { id } = req.params;

  const avatar = path.join(__dirname, '../public/avatars/', id + '.png');

  if (fs.existsSync(avatar)) {
    res.sendFile(avatar);
  } else {
    res.json({ error: 'There is no such avatar.' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/');
  },
  filename: (req, file, cb) => {
    const user_id = req.user._id;
    const fileName = user_id.toString() + '.png';
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

const updateAvatar = [
  upload.single('avatar'),
  async (req, res) => {
    const user_id = req.user._id;

    try {
      await sharp(req.file.path).resize(200, 200).png({ quality: 100 }).toFile(path.resolve(req.file.destination, 'avatars', req.file.filename));
      fs.unlinkSync(req.file.path);

      const user = await User.updateAvatar(user_id);

      res.status(200).json({ username: user.username });
    } catch (err) {
      res.status(400).json({ error: 'There was an error.' });
    }
  },
];

const updatePassword = async (req, res) => {
  const user_id = req.user._id;
  const { password, newPassword } = req.body;

  try {
    const user = await User.updatePassword(user_id, password, newPassword);

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  const user_id = req.user._id;
  const { password } = req.body;

  try {
    const user = await User.deleteUser(user_id, password);

    // delete all data associated with user

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { login, signup, getAvatar, updateAvatar, updatePassword, deleteUser };

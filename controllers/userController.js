const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Buffer } = require('buffer');

const createToken = (_id, expiresIn) => {
  return jwt.sign({ _id }, process.env.SECRET, expiresIn && { expiresIn });
};

const login = async (req, res) => {
  const { username, password, expiresIn } = req.body;

  try {
    const user = await User.login(username, password);

    const token = createToken(user._id, !expiresIn && '24h');

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      updatedAt: user.updatedAt,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const signup = async (req, res) => {
  const { username, email, password, expiresIn } = req.body;

  try {
    const user = await User.signup(username, email, password);

    const token = createToken(user._id, !expiresIn && '24h');

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      updatedAt: user.updatedAt,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAvatar = async (req, res) => {
  const { id } = req.params;

  const avatar = path.join(__dirname, '../public/avatars/', id + '.png');

  if (await fs.existsSync(avatar)) {
    res.sendFile(avatar);
  } else {
    try {
      const user = await User.findById(id);

      const dataBSON = JSON.stringify(user.avatar);

      const dataJSON = JSON.parse(dataBSON);

      const dataBuffer = await Buffer.from(dataJSON.buffer.data);

      await fs.writeFileSync(avatar, dataBuffer);

      res.sendFile(avatar);
    } catch (err) {
      res.status(400).json({ error: 'There was an error' });
    }
  }
};

const authorize = async (req, res) => {
  const { username } = req.user;

  res.status(200).json({ username });
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.split('/')[0] === 'image') {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  },
});

const updateAvatar = [
  upload.single('avatar'),
  async (req, res) => {
    const user_id = req.user._id;

    await sharp(req.file.buffer)
      .resize(200, 200)
      .png({ quality: 100 })
      .toFile(path.join(__dirname, '../public/avatars/', user_id + '.png'));

    try {
      const avatar = await Buffer.from(fs.readFileSync(path.join(__dirname, '../public/avatars/', user_id + '.png')));

      const user = await User.updateAvatar(user_id, avatar);

      res.status(200).json({ username: user.username });
    } catch (err) {
      console.log(err);
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

  try {
    const user = await User.deleteUser(user_id);

    if (user.avatar) fs.unlinkSync(path.join(__dirname, '../public/avatars/', user_id + '.png'));

    // delete all data associated with user

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { login, signup, getAvatar, authorize, updateAvatar, updatePassword, deleteUser };

const express = require('express');

const userController = require('../controllers/userController');
const isAuthorized = require('../middlewares/isAuthorized');

const router = express.Router();

router.post('/login', userController.login);

router.post('/signup', userController.signup);

router.get('/avatar/:id', userController.getAvatar);

router.use(isAuthorized);

router.patch('/avatar', userController.updateAvatar);

router.patch('/update', userController.updatePassword);

router.delete('/delete', userController.deleteUser);

module.exports = router;

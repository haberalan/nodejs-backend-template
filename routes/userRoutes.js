const express = require('express');

const userController = require('../controllers/userController');
const isAuthorized = require('../middlewares/isAuthorized');

const router = express.Router();

router.post('/login', userController.login);

router.post('/signup', userController.signup);

router.use(isAuthorized);

router.patch('/update', userController.updateUser);

router.delete('/delete', userController.deleteUser);

module.exports = router;

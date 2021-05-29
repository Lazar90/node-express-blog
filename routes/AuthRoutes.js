const { Router } = require('express');
const authController = require('../app/controllers/AuthController');
const { check } = require('express-validator');
const { UserEmailExists } = require('../app/validator');
const { notAuthenticated } = require('../app/middleware/auth');
const router = Router();

router.use(notAuthenticated);
router.get('/login', authController.loginGet);
router.post('/login', authController.loginPost);
router.get('/register', authController.registerGet);
router.post('/register',[
    check('name')
        .notEmpty().withMessage('Name is required.')
        .bail()
        .isLength({ min: 2, max: 50}).withMessage('The length of Name is min 2 max 50.'),
    check('lastName')
        .notEmpty().withMessage('Last Name is required.')
        .bail()
        .isLength({ min: 2, max: 50}).withMessage('The length of Last Name is min 2 max 50.'),
    check('email')
        .notEmpty().withMessage('Email is required.')
        .bail()
        .normalizeEmail()
        .isEmail().withMessage('Email is invalid.')
        .custom(UserEmailExists),
    check('password')
        .notEmpty().withMessage('Password is required.')
        .bail()
        .isLength({ min: 6}).withMessage('Min lenght of password is 6 characters.'),
    check('passwordConfirmation')
        .custom((value, { req }) => value === req.body.password).withMessage('Passwords did not match.'),
],
authController.registerPost);

module.exports = router;
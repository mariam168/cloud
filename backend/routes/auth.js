const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const verifyRecaptcha = async (req, res, next) => {
    const { recaptchaToken } = req.body;
    if (!recaptchaToken) {
        console.log("reCAPTCHA token is missing from request body.");
        return res.status(400).json({ message: 'reCAPTCHA token is missing.' });
    }
    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        );
        const { success, score } = response.data;
        if (!success) {
            console.error('reCAPTCHA verification failed from Google:', response.data['error-codes']);
            return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
        }
        next(); 
    } catch (error) {
        console.error('Error during reCAPTCHA verification (axios request failed or unexpected response):', error.message);
        if (error.response) {
            console.error('Axios error response data:', error.response.data);
        }
        return res.status(500).json({ message: 'Server error during reCAPTCHA verification.' });
    }
};
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    verifyRecaptcha, 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, role } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists with this email' }] });
            }
            user = new User({ name, email, password, role: role || 'user', isActivated: false });
            const activationToken = user.getActivationToken(); 
            await user.save(); 

            const activationUrl = `${process.env.CLIENT_URL}/activate/${activationToken}`;
            const message = `
                <h1>Email Account Activation</h1>
                <p>You are receiving this because you (or someone else) has requested to activate your account for ${process.env.FROM_NAME}.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="${activationUrl}" clicktracking="off">${activationUrl}</a>
                <br>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not request this, please ignore this email and your account will remain inactive.</p>
            `;
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Account Activation for ' + process.env.FROM_NAME,
                    message,
                });
                res.status(201).json({
                    success: true,
                    message: 'Registration successful! Please check your email for activation link.',
                    user: { id: user.id, name: user.name, email: user.email, role: user.role, isActivated: user.isActivated }
                });
            } catch (emailError) {
                console.error('Error sending activation email:', emailError);
                user.activationToken = undefined; 
                user.activationTokenExpire = undefined;
                await user.save({ validateBeforeSave: false }); 
                return res.status(500).json({ message: 'Error sending activation email. Please try again later.' });
            }

        } catch (err) {
            console.error('Server error during registration:', err.message);
            res.status(500).send('Server error');
        }
    }
);
router.get('/activate/:token', async (req, res) => {
    const activationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            activationToken,
            activationTokenExpire: { $gt: Date.now() }, 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired activation token.' });
        }

        user.isActivated = true;
        user.activationToken = undefined;
        user.activationTokenExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account activated successfully!',
        });
    } catch (err) {
        console.error('Server error during activation:', err.message);
        res.status(500).send('Server error');
    }
});
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            if (!user.isActivated) {
                return res.status(400).json({ errors: [{ msg: 'Account not activated. Please check your email for the activation link.' }] });
            }

            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id,
                    role: user.role,
                },
            };
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '30d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isActivated: user.isActivated } });
                }
            );
        } catch (err) {
            console.error('Server error during login:', err.message);
            res.status(500).send('Server error');
        }
    }
);
router.post('/forgotpassword', verifyRecaptcha, async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset email has been sent.' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false }); 

        const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;
        const message = `
            <h1>Password Reset Request</h1>
            <p>You are receiving this because you (or someone else) has requested the reset of a password for your account for ${process.env.FROM_NAME}.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <br>
            <p>This link will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token for ' + process.env.FROM_NAME,
                message,
            });

            res.status(200).json({ success: true, message: 'Password reset email sent successfully.' });
        } catch (emailError) {
            console.error('Error sending reset password email:', emailError);
            user.resetPasswordToken = undefined; 
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Error sending password reset email. Please try again later.' });
        }
    } catch (err) {
        console.error('Server error during forgot password:', err.message);
        res.status(500).send('Server error');
    }
});
router.get('/validate-reset-token/:token', async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        res.status(200).json({ success: true, message: 'Token is valid.' });
    } catch (err) {
        console.error('Server error during token validation:', err.message);
        res.status(500).send('Server error');
    }
});
router.put('/resetpassword/:token', async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        user.password = req.body.password; 
        user.resetPasswordToken = undefined; 
        user.resetPasswordExpire = undefined; 
        await user.save(); 
        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Server error during password reset:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
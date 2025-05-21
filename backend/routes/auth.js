const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();
const crypto = require('crypto');
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors during registration:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        try {
            console.log("Attempting to find user by email:", email);
            let user = await User.findOne({ email });
            if (user) {
                console.log("User already exists:", email);
                return res.status(400).json({ errors: [{ msg: 'User already exists with this email' }] });
            }

            console.log("Creating new user instance.");
            user = new User({
                name,
                email,
                password,
                role: role || 'user',
                isActivated: false,
            });
            console.log("Generating activation token.");
            const activationToken = user.getActivationToken();           
            console.log("Saving user to database with activation token.");
            await user.save();
            console.log("User saved. Preparing activation email.");
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
                console.log("Attempting to send activation email.");
                await sendEmail({
                    email: user.email,
                    subject: 'Account Activation for ' + process.env.FROM_NAME,
                    message,
                });
                console.log("Activation email sent successfully.");
                console.log("Attempting to send success response to frontend.");
                res.status(201).json({
                    success: true,
                    message: 'Registration successful! Please check your email for activation link.',
                    user: { id: user.id, name: user.name, email: user.email, role: user.role, isActivated: user.isActivated }
                });
                console.log("Success response sent.");
            } catch (emailError) {
                console.error('Error sending activation email or sending response:', emailError);
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
    console.log("Activation route hit.");
    const activationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    try {
        console.log("Searching for user with activation token.");
        const user = await User.findOne({
            activationToken,
            activationTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            console.log("Invalid or expired activation token found.");
            return res.status(400).json({ message: 'Invalid or expired activation token.' });
        }

        console.log("User found. Activating account.");
        user.isActivated = true;
        user.activationToken = undefined;
        user.activationTokenExpire = undefined;

        await user.save();
        console.log("Account activated and user saved.");

        res.status(200).json({
            success: true,
            message: 'Account activated successfully!',
        });
        console.log("Activation success response sent.");
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
            console.log("Validation errors during login:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            console.log("Attempting to find user for login:", email);
            let user = await User.findOne({ email }).select('+password');
            if (!user) {
                console.log("User not found for login:", email);
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            console.log("Checking if account is activated.");
            if (!user.isActivated) {
                console.log("Account not activated for user:", email);
                return res.status(400).json({ errors: [{ msg: 'Account not activated. Please check your email for the activation link.' }] });
            }

            console.log("Matching password.");
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                console.log("Password mismatch for user:", email);
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            console.log("Generating JWT payload.");
            const payload = {
                user: {
                    id: user.id,
                    role: user.role,
                },
            };

            console.log("Signing JWT token.");
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '30d' },
                (err, token) => {
                    if (err) {
                        console.error("Error signing JWT:", err);
                        throw err;
                    }
                    console.log("JWT signed. Sending login response.");
                    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isActivated: user.isActivated } });
                    console.log("Login response sent.");
                }
            );
        } catch (err) {
            console.error('Server error during login:', err.message);
            res.status(500).send('Server error');
        }
    }
);
router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;
    console.log("Forgot password request for email:", email);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found for forgot password:", email);
            return res.status(404).json({ message: 'User not found with that email address.' });
        }

        console.log("Generating reset token.");
        const resetToken = user.getResetPasswordToken();
        await user.save();
        console.log("User saved with reset token.");

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
            console.log("Attempting to send password reset email.");
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token for ' + process.env.FROM_NAME,
                message,
            });
            console.log("Password reset email sent successfully.");

            res.status(200).json({ success: true, message: 'Password reset email sent successfully.' });
            console.log("Forgot password success response sent.");
        } catch (emailError) {
            console.error('Error sending reset password email or sending response:', emailError);
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
router.put('/resetpassword/:token', async (req, res) => {
    console.log("Reset password route hit.");
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    try {
        console.log("Searching for user with reset token.");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            console.log("Invalid or expired reset token found.");
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        console.log("User found. Setting new password.");
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        console.log("Password reset and user saved.");

        res.status(200).json({ success: true, message: 'Password reset successfully.' });
        console.log("Reset password success response sent.");
    } catch (err) {
        console.error('Server error during password reset:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

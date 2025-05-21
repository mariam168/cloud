const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios'); // Import axios for making HTTP requests

// Function to verify reCAPTCHA token
const verifyRecaptcha = async (req, res, next) => {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
        console.log("reCAPTCHA token is missing from request body.");
        return res.status(400).json({ message: 'reCAPTCHA token is missing.' });
    }

    try {
        console.log("Attempting to verify reCAPTCHA with Google...");
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        );

        console.log("Google reCAPTCHA API Response:", response.data); // Log the full response from Google

        const { success, score } = response.data;

        if (!success) {
            console.error('reCAPTCHA verification failed from Google:', response.data['error-codes']);
            return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
        }

        console.log("reCAPTCHA verification successful.");
        next(); // reCAPTCHA verified, proceed to next middleware/route handler
    } catch (error) {
        console.error('Error during reCAPTCHA verification (axios request failed or unexpected response):', error.message);
        // Log the full error object if available
        if (error.response) {
            console.error('Axios error response data:', error.response.data);
            console.error('Axios error response status:', error.response.status);
            console.error('Axios error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Axios error request:', error.request); // The request was made but no response was received
        } else {
            console.error('Axios error message:', error.message); // Something happened in setting up the request that triggered an Error
        }
        return res.status(500).json({ message: 'Server error during reCAPTCHA verification.' });
    }
};

// @route   POST api/auth/register
// @desc    Register user & send activation email
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    verifyRecaptcha, // Add reCAPTCHA verification middleware here
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
                isActivated: false, // User is not activated by default
            });

            console.log("Generating activation token.");
            const activationToken = user.getActivationToken(); // This updates user object
            
            console.log("Saving user to database with activation token.");
            await user.save(); // Save user with hashed password and activation token

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
                user.activationToken = undefined; // Clear token if email failed
                user.activationTokenExpire = undefined;
                await user.save({ validateBeforeSave: false }); // Save without re-validating
                return res.status(500).json({ message: 'Error sending activation email. Please try again later.' });
            }

        } catch (err) {
            console.error('Server error during registration:', err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET api/auth/activate/:token
// @desc    Activate user account
// @access  Public
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
            activationTokenExpire: { $gt: Date.now() }, // Token not expired
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


// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    // No reCAPTCHA for login, as it can be annoying for legitimate users
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

            const payload = {
                user: {
                    id: user.id,
                    role: user.role,
                },
            };

            console.log("Generating JWT payload.");
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

// @route   POST api/auth/forgotpassword
// @desc    Request password reset link
// @access  Public
router.post('/forgotpassword', verifyRecaptcha, async (req, res) => {
    const { email } = req.body;
    console.log("Forgot password request for email:", email);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found for forgot password:", email);
            // It's good practice not to reveal if an email exists for security reasons
            return res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset email has been sent.' });
        }

        console.log("Generating reset token.");
        const resetToken = user.getResetPasswordToken();
        await user.save(); // Save user with hashed reset token and expiry
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
            user.resetPasswordToken = undefined; // Clear token if email failed
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false }); // Save without re-validating
            return res.status(500).json({ message: 'Error sending password reset email. Please try again later.' });
        }
    } catch (err) {
        console.error('Server error during forgot password:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/validate-reset-token/:token
// @desc    Validate if a reset token is valid and not expired without consuming it
// @access  Public
router.get('/validate-reset-token/:token', async (req, res) => {
    console.log("Validate reset token route hit.");
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
            console.log("Invalid or expired reset token found during validation.");
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        console.log("Reset token is valid.");
        res.status(200).json({ success: true, message: 'Token is valid.' });
    } catch (err) {
        console.error('Server error during token validation:', err.message);
        res.status(500).send('Server error');
    }
});


// @route   PUT api/auth/resetpassword/:token
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:token', async (req, res) => {
    console.log("Reset password route hit (for actual password change).");
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+password'); // Select password to be able to modify it

        if (!user) {
            console.log("Invalid or expired reset token found during password change attempt.");
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Check if passwords match (added for frontend validation consistency)
        if (req.body.password !== req.body.password2) {
            console.log("Passwords do not match during password change attempt.");
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        console.log("User found. Setting new password and clearing token.");
        user.password = req.body.password;
        user.resetPasswordToken = undefined; // Clear token ONLY AFTER successful password change
        user.resetPasswordExpire = undefined;

        await user.save(); // Mongoose pre-save hook will hash the new password
        console.log("Password reset and user saved successfully.");

        res.status(200).json({ success: true, message: 'Password reset successfully.' });
        console.log("Reset password success response sent.");
    } catch (err) {
        console.error('Server error during password reset:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST endpoint to send verification email
router.post('/send-verification-email', async (req, res) => {
    const { email } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'almarioelopre@gmail.com',
            pass: 'almario123' // Use app password instead of regular password
        }
    });
    

    // Compose the email
    const mailOptions = {
        from: 'almarioelopre@gmail.com', // Sender address
        to: email, // Recipient address
        subject: 'Email Verification', // Subject line
        text: 'Please click the link below to verify your email.', // Plain text body
        html: '<p>Please click the link below to verify your email.</p>' // HTML body
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully.');
        res.status(200).json({ message: 'Verification email sent successfully.' });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ error: 'Error sending verification email.' });
    }
});

module.exports = router;

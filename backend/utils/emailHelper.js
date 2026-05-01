const nodemailer = require("nodemailer");

const buildOtpMessage = (purpose, otp) => {
    const isPasswordReset = purpose === "password-reset";

    return {
        subject: isPasswordReset
            ? "Reset Your Password - Pawly Pet Care"
            : "Verify Your Email - Pawly Pet Care Registration",
        text: isPasswordReset
            ? `Your password reset OTP is: ${otp}. This code will expire in 10 minutes.`
            : `Welcome to Pawly Pet Care! Your verification OTP is: ${otp}. This code will expire in 10 minutes.`,
        heading: isPasswordReset ? "Reset Your Password" : "Welcome to PetCare!",
        body: isPasswordReset
            ? "Use the following One-Time Password (OTP) to confirm your password reset request."
            : "We're thrilled to have you join our pet-care family. Please use the following One-Time Password (OTP) to verify your registration.",
        footer: isPasswordReset
            ? "If you did not request a password reset, you can safely ignore this email."
            : "If you did not sign up for Pawly Pet Care, you can safely ignore this email.",
    };
};

/**
 * Send an OTP to the user's email
 * @param {String} email - The user's email address
 * @param {String} otp - The generated OTP
 * @param {String} purpose - The OTP purpose
 */
const sendOTPEmail = async (email, otp, purpose = "registration") => {
    try {
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = parseInt(process.env.SMTP_PORT || '465');
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;

        if (!user || !pass) {
            console.error("Email configuration missing. Please verify EMAIL_USER and EMAIL_PASS in your .env file.");
            return false;
        }

        const message = buildOtpMessage(purpose, otp);

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for port 465, false for other ports
            auth: {
                user,
                pass,
            },
        });

        const mailOptions = {
            from: `"Pawly Pet Care" <${user}>`,
            to: email,
            subject: message.subject,
            text: message.text,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; text-align: center;">
                    <div style="max-width: 550px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin: 0 auto; overflow: hidden;">
                        <div style="background-color: #a2d2ff; padding: 24px 20px; border-bottom: 1px solid #30628a; text-align: center;">
                            <div style="font-size: 40px; line-height: 1; margin-bottom: 8px;">🐾</div>
                            <div style="font-size: 28px; font-weight: 800; line-height: 1.2;">
                                <span style="color: #79573f;">Pet</span><span style="color: #30628a;">Care</span>
                            </div>
                        </div>

                        <div style="background-color: #fff9ec; padding: 40px 30px; text-align: center;">
                            <h1 style="color: #79573f; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 700;">${message.heading}</h1>
                            <p style="color: #41474e; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                                ${message.body}
                            </p>
                            <div style="background: rgba(162,210,255,0.3); padding: 18px 24px; border-radius: 12px; margin-bottom: 30px; display: inline-block;">
                                <span style="font-size: 36px; font-weight: 800; color: #30628a; letter-spacing: 6px;">${otp}</span>
                            </div>
                            <p style="color: #41474e; font-size: 13px; margin-top: 12px;">
                                Note: This OTP is valid for <strong>10 minutes</strong> only. Do not share this code with anyone.
                            </p>
                            <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                <p style="color: #94a3b8; font-size: 12px;">
                                    ${message.footer}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending email via Nodemailer:", error.message);
        return false;
    }
};

module.exports = { sendOTPEmail };

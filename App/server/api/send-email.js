// server/api/send-email.js
import { defineEventHandler, readBody } from 'h3';
import nodemailer from 'nodemailer';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const transporter = nodemailer.createTransport({
        host: 'smtp.server.de', // SMTP-Server-Adresse
        port: 587, // oder 465 für SSL oder 587
        secure: false, // true für 465, false für andere Ports
        auth: {
            user: 'User',
            pass: 'Passwort'
        },
        tls: {
            // Diese Einstellung kann helfen, wenn es ein Problem mit der Zertifikatsprüfung gibt
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: 'noreply@accdb.de',
        to: body.to,
        subject: body.subject,
        text: body.text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            message: 'Email sent: ' + info.response
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error: ' + error.message
        };
    }
});

import nodemailer from 'nodemailer';

/**
 * Universal email sender.
 * 1. Tries SMTP (Gmail/Nodemailer) if configured.
 * 2. Logs to console if configuration is missing or fails.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    // 1. Try Nodemailer/SMTP (Recommended: Gmail App Password)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: `"AdvayDecor" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
            return { success: true, method: 'nodemailer' };
        } catch (err) {
            console.error('Nodemailer Error:', err);
            // Fall through to console log
        }
    }

    // 2. Fallback: Console Log (Useful if credentials aren't set)
    console.log('------------------------------------------');
    console.log(`EMAIL TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`OTP (extracted): ${html.match(/>(\d{8})</)?.[1] || 'No code found'}`);
    console.log('ALERT: SMTP not configured. Code logged above.');
    console.log('------------------------------------------');

    return { success: true, method: 'console' };
}

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

dotenv.config();

export interface SendResetEmailParams {
  to: string;
  studentName: string;
  studentNumber: string;
  resetCode: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({
  to,
  studentName,
  studentNumber,
  resetCode,
  resetLink,
}: SendResetEmailParams): Promise<{ sent: boolean; message?: string; error?: string }> {
  const smtpUser = process.env.SMTP_USER || 'naledimashabane001@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'saqs avgu cgpy ibvj';
  const smtpHost =
    process.env.SMTP_HOST ||
    (smtpUser && smtpUser.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpFrom =
    process.env.SMTP_FROM || `"TUT Student Portal" <${smtpUser || 'no-reply@tut4life.ac.za'}>`;

  if (!smtpUser || !smtpPass) {
    console.warn(
      '⚠️ [EmailService] SMTP credentials (SMTP_USER / SMTP_PASS) not configured in .env. Email dispatch simulated.'
    );
    return {
      sent: false,
      message: 'SMTP not configured on server. Token generated for direct portal access.',
    };
  }

  let htmlContent = '';

  try {
    const isGmail = smtpUser.toLowerCase().includes('@gmail.com');
    let targetHost = smtpHost || 'smtp.gmail.com';
    if (isGmail) {
      try {
        const ips = await dns.promises.resolve4('smtp.gmail.com');
        if (ips && ips.length > 0) {
          targetHost = ips[0];
          console.log(`[EmailService] Direct IPv4 resolved for Gmail: ${targetHost}`);
        }
      } catch (dnsErr: any) {
        console.warn('[EmailService] DNS resolve4 warning:', dnsErr.message);
      }
    }

    const transportOptions: any = isGmail
      ? {
          host: targetHost,
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            servername: 'smtp.gmail.com',
            rejectUnauthorized: false,
          },
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 5000,
        }
      : {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 5000,
        };

    const transporter = nodemailer.createTransport(transportOptions);

    htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #065f46 0%, #022c22 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #10b981;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
            🎓 Tshwane University of Technology
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #6ee7b7; font-weight: 600;">
            Student Budget and Expense Tracker Portal
          </p>
        </div>
        
        <div style="padding: 32px 24px;">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #ffffff;">
            Password Reset Request
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
            Hello <strong>${studentName || 'Student'}</strong> (${studentNumber}),
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            We received a request to reset the password for your student expense account. Use the 6-digit verification code below or click the button to set your new password:
          </p>

          <div style="background-color: #1e293b; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 6px; font-weight: 700;">
              Your 6-Digit Verification Code
            </span>
            <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #34d399;">
              ${resetCode}
            </span>
            <span style="display: block; font-size: 11px; color: #64748b; margin-top: 8px;">
              Expires in 60 minutes
            </span>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${resetLink}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);">
              Reset My Password &rarr;
            </a>
          </div>

          <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
            Or copy and paste this link into your browser:
          </p>
          <p style="margin: 0 0 24px 0; font-size: 11px; color: #38bdf8; word-break: break-all;">
            <a href="${resetLink}" style="color: #38bdf8;">${resetLink}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />

          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="background-color: #020617; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="margin: 0; font-size: 11px; color: #64748b;">
            Department of Computer Systems Engineering • Work-Integrated Learning (PJD301B)
          </p>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #475569;">
            Tshwane University of Technology • Pretoria / Soshanguve Campus
          </p>
        </div>
      </div>
    `;

    const mailPayload = {
      from: smtpFrom,
      to,
      subject: `🎓 TUT Student Portal: Password Reset Code (${resetCode})`,
      text: `Hello ${studentName} (${studentNumber}),\n\nYour password reset code is: ${resetCode}\n\nReset your password at: ${resetLink}\n\nThis code expires in 60 minutes.\n\nIf you did not request this, please disregard.`,
      html: htmlContent,
    };

    let info;
    try {
      info = await transporter.sendMail(mailPayload);
    } catch (primaryErr: any) {
      if (isGmail) {
        console.warn('⚠️ Port 465 attempt failed, retrying over Gmail port 587 (STARTTLS IPv4):', primaryErr.message);
        const fallbackTransporter = nodemailer.createTransport({
          host: targetHost,
          port: 587,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            servername: 'smtp.gmail.com',
            rejectUnauthorized: false,
          },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 20000,
        } as any);
        info = await fallbackTransporter.sendMail(mailPayload);
      } else {
        throw primaryErr;
      }
    }

    console.log(`✅ [EmailService] Password reset email successfully sent to ${to}: ${info.messageId}`);
    return { sent: true, message: `Email delivered to ${to}` };
  } catch (smtpErr: any) {
    console.warn(`⚠️ [EmailService] SMTP connection failed/blocked (${smtpErr.message}). Retrying via HTTPS (Port 443) gateway...`);

    // 1. If Google Apps Script or custom webhook is configured
    if (process.env.EMAIL_WEBHOOK_URL) {
      try {
        const hookRes = await fetch(process.env.EMAIL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            subject: `🎓 TUT Student Portal: Password Reset Code (${resetCode})`,
            html: htmlContent,
            resetCode,
            resetLink,
          }),
        });
        if (hookRes.ok) {
          console.log(`✅ [EmailService] Email delivered to ${to} via Webhook`);
          return { sent: true, message: `Email delivered to ${to} via Webhook` };
        }
      } catch (hookErr: any) {
        console.warn('⚠️ [EmailService] Webhook attempt failed:', hookErr.message);
      }
    }

    // 2. HTTPS Gateway fallback over Port 443 (Unrestricted on Render free tier)
    try {
      const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://expense-naledi3.vercel.app',
          'Referer': 'https://expense-naledi3.vercel.app/',
        },
        body: JSON.stringify({
          _subject: `🎓 TUT Student Portal: Password Reset Code (${resetCode})`,
          'Student Name': studentName,
          'Student Number': studentNumber,
          'Verification Code': resetCode,
          'Reset Link': resetLink,
          'Security Note': 'Valid for 60 minutes. Do not share this code.',
        }),
      });

      const fsData: any = await fsRes.json().catch(() => ({}));
      if (fsData && (fsData.success === 'true' || fsData.success === true)) {
        console.log(`✅ [EmailService] Password reset email successfully sent to ${to} via HTTPS Gateway!`);
        return { sent: true, message: `Email delivered to ${to} via HTTPS gateway` };
      }
      if (fsData && fsData.message && fsData.message.includes('Activation')) {
        console.warn(`ℹ️ [EmailService] Activation email sent to ${to} by gateway.`);
        return { sent: false, error: 'Please check your email to activate the email gateway, or use the on-screen code.' };
      }
    } catch (gatewayErr: any) {
      console.error('❌ [EmailService] HTTPS gateway error:', gatewayErr.message);
    }

    console.error(`❌ [EmailService] All delivery methods exhausted for ${to}:`, smtpErr.message);
    return { sent: false, error: smtpErr.message };
  }
}

import { Request, Response } from 'express';
import { db } from '../config/db';
import { sendPasswordResetEmail } from '../services/emailService';

function maskEmail(email: string): string {
  if (!email) return 'Registered University Email';
  const clean = email.trim();
  const atIdx = clean.indexOf('@');
  if (atIdx === -1) return clean;
  const username = clean.slice(0, atIdx);
  const domain = clean.slice(atIdx + 1);
  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }
  return `${username.slice(0, 3)}***${username.slice(-1)}@${domain}`;
}

const DEMO_STUDENT = {
  id: 'tut-230099774',
  name: 'Naledi Perseverance Mashabane',
  studentNumber: '230099774',
  email: 'naledimashabane001@gmail.com',
  institution: 'Tshwane University of Technology',
  department: 'Computer Systems Engineering',
  monthlyAllowance: 3500,
  avatarInitials: 'NM',
};

export const authController = {
  // POST /api/auth/login
  async login(req: Request, res: Response) {
    try {
      const username = req.body.username || req.body.identifier;
      const password = req.body.password !== undefined ? req.body.password : req.body.pin;
      if (!username) {
        return res.status(400).json({ success: false, error: 'Student number or email is required' });
      }

      const cleanId = String(username).trim();
      const cleanIdLower = cleanId.toLowerCase();
      const enteredPassword = password !== undefined && password !== null ? String(password).trim() : '';

      if (!enteredPassword) {
        return res.status(400).json({ success: false, error: 'Password or PIN is required to sign in' });
      }

      // 1. Check database for registered student
      let student = await db.students.findByStudentNumber(cleanId);
      if (!student && cleanIdLower.includes('@')) {
        student = await db.students.findByEmail(cleanIdLower);
      }

      if (student) {
        // Strictly verify PIN / Password against student's chosen password
        const expectedPin = String(student.password_pin || '1234').trim();
        if (enteredPassword !== expectedPin) {
          return res.status(401).json({ success: false, error: 'Incorrect password or PIN. Please try again.' });
        }

        const initials = String(student.name)
          .split(' ')
          .map((p: string) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'ST';

        const user = {
          id: `tut-${student.student_number}`,
          name: student.name,
          studentNumber: student.student_number,
          email: student.email,
          phoneNumber: student.phone_number || '',
          institution: 'Tshwane University of Technology',
          department: 'Computer Systems Engineering',
          monthlyAllowance: Number(student.monthly_allowance) || 3500,
          avatarInitials: initials,
        };

        return res.json({
          success: true,
          message: 'Student authenticated successfully',
          user,
          token: `tut-token-${student.student_number}`,
        });
      }

      // Check by phone number if not found by student_number or email
      if (!student) {
        student = await db.students.findByPhone(cleanId);
        if (student) {
          const expectedPin = String(student.password_pin || '1234').trim();
          if (enteredPassword !== expectedPin) {
            return res.status(401).json({ success: false, error: 'Incorrect password or PIN. Please try again.' });
          }

          const initials = String(student.name)
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'ST';

          const user = {
            id: `tut-${student.student_number}`,
            name: student.name,
            studentNumber: student.student_number,
            email: student.email,
            phoneNumber: student.phone_number || '',
            institution: 'Tshwane University of Technology',
            department: 'Computer Systems Engineering',
            monthlyAllowance: Number(student.monthly_allowance) || 3500,
            avatarInitials: initials,
          };

          return res.json({
            success: true,
            message: 'Student authenticated successfully',
            user,
            token: `tut-token-${student.student_number}`,
          });
        }
      }

      // 2. Demo Student fallback for Naledi Mashabane (230099774)
      if (
        cleanIdLower === '230099774' ||
        cleanIdLower === 'naledimashabane001@gmail.com' ||
        cleanIdLower === '0710000000' ||
        cleanIdLower.includes('230099774') ||
        cleanIdLower === 'admin'
      ) {
        if (enteredPassword !== '1234') {
          return res.status(401).json({ success: false, error: 'Incorrect PIN for demo student (Default is 1234).' });
        }

        // Ensure Naledi is recorded in DB
        await db.students.create({
          name: DEMO_STUDENT.name,
          student_number: DEMO_STUDENT.studentNumber,
          email: DEMO_STUDENT.email,
          phone_number: '0710000000',
          password_pin: '1234',
          monthly_allowance: 3500,
        });

        return res.json({
          success: true,
          message: 'Student authenticated successfully',
          user: { ...DEMO_STUDENT, phoneNumber: '0710000000' },
          token: 'tut-session-token-demo',
        });
      }

      // 3. Not registered
      return res.status(404).json({
        success: false,
        error: `Account "${cleanId}" not found. Please click "Register New Student" to create your account and password.`,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Authentication failed' });
    }
  },

  // POST /api/auth/register
  async register(req: Request, res: Response) {
    try {
      const { name, studentNumber, email, phone, phoneNumber, password, monthlyAllowance, idNumber, id_number } = req.body;
      if (!name || !studentNumber) {
        return res.status(400).json({ success: false, error: 'Full name and student number are required' });
      }

      const cleanPassword = password !== undefined && password !== null ? String(password).trim() : '';
      if (!cleanPassword || cleanPassword.length < 4) {
        return res.status(400).json({ success: false, error: 'Please create a password of at least 4 characters.' });
      }

      const cleanNum = String(studentNumber).trim();
      const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanNum}@tut4life.ac.za`;
      const cleanPhone = (phoneNumber || phone) ? String(phoneNumber || phone).trim() : '';
      const cleanIdNum = (idNumber || id_number) ? String(idNumber || id_number).trim().replace(/\s+/g, '') : null;
      const cleanName = String(name).trim();
      const allowance = Number(monthlyAllowance) || 3500;

      if (cleanIdNum && cleanIdNum.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid South African ID number (13 digits) or passport number.',
        });
      }

      // 0. Verify if account already exists for student number, email, phone, or ID number
      const existingByNumber = await db.students.findByStudentNumber(cleanNum);
      if (existingByNumber) {
        return res.status(409).json({
          success: false,
          error: `An account with student number ${cleanNum} already exists. Please sign in or use "Forgot Password".`,
        });
      }

      const existingByEmail = await db.students.findByEmail(cleanEmail);
      if (existingByEmail) {
        return res.status(409).json({
          success: false,
          error: `An account with email "${cleanEmail}" already exists. Please sign in or use "Forgot Password".`,
        });
      }

      if (cleanPhone) {
        const existingByPhone = await db.students.findByPhone(cleanPhone);
        if (existingByPhone) {
          return res.status(409).json({
            success: false,
            error: `An account with phone number "${cleanPhone}" already exists. Please sign in or use "Forgot Password".`,
          });
        }
      }

      if (cleanIdNum) {
        const existingById = await db.students.findByIdNumber(cleanIdNum);
        if (existingById) {
          return res.status(409).json({
            success: false,
            error: 'An account with this South African ID number is already registered. Please sign in or use "Forgot Password".',
          });
        }
      }

      // 1. Create student in database with student's custom password, phone, and ID number
      const student = await db.students.create({
        name: cleanName,
        student_number: cleanNum,
        email: cleanEmail,
        phone_number: cleanPhone,
        id_number: cleanIdNum,
        password_pin: cleanPassword,
        monthly_allowance: allowance,
      });

      // 2. Create isolated monthly budget for this student
      await db.budgets.upsert('2026-09', allowance, 'Monthly allowance', cleanNum);

      const initials = cleanName
        .split(' ')
        .map((p: string) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ST';

      const newUser = {
        id: `tut-${student.student_number}`,
        name: student.name,
        studentNumber: student.student_number,
        email: student.email,
        phoneNumber: student.phone_number || cleanPhone,
        idNumber: student.id_number || cleanIdNum || '',
        institution: 'Tshwane University of Technology',
        department: 'Computer Systems Engineering',
        monthlyAllowance: Number(student.monthly_allowance) || allowance,
        avatarInitials: initials,
      };

      return res.json({
        success: true,
        message: 'Student account created in database successfully',
        user: newUser,
        token: `tut-session-token-${cleanNum}`,
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
    }
  },

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { identifier } = req.body;
      if (!identifier) {
        return res.status(400).json({ success: false, error: 'Student number or university email is required' });
      }

      const cleanId = String(identifier).trim();
      const cleanIdLower = cleanId.toLowerCase();

      let student = await db.students.findByStudentNumber(cleanId);
      if (!student && cleanIdLower.includes('@')) {
        student = await db.students.findByEmail(cleanIdLower);
      }
      if (!student) {
        student = await db.students.findByPhone(cleanId);
      }

      // If demo student Naledi and not yet saved in DB
      if (!student && (cleanIdLower === '230099774' || cleanIdLower.includes('230099774') || cleanIdLower === 'naledimashabane001@gmail.com' || cleanIdLower === '0710000000')) {
        student = await db.students.create({
          name: DEMO_STUDENT.name,
          student_number: DEMO_STUDENT.studentNumber,
          email: DEMO_STUDENT.email,
          phone_number: '0710000000',
          password_pin: '1234',
          monthly_allowance: 3500,
        });
      }

      if (!student) {
        return res.status(404).json({
          success: false,
          error: `No student account found for "${cleanId}". Please verify your student number or university email.`,
        });
      }

      // Generate a secure 6-digit verification code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes expiration

      await db.students.saveResetToken(student.student_number, resetCode, expiresAt);

      const clientBase =
        process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost')
          ? process.env.CLIENT_URL
          : (process.env.NODE_ENV === 'production'
              ? 'https://expense-naledi3.vercel.app'
              : (process.env.CLIENT_URL || 'https://expense-naledi3.vercel.app'));

      const fullResetLink = `${clientBase.replace(/\/$/, '')}/login?mode=reset&token=${resetCode}&student=${student.student_number}`;

      const targetEmail = (student.email || `${student.student_number}@tut4life.ac.za`).trim().toLowerCase();
      const maskedContact = maskEmail(targetEmail);

      // Immediately dispatch real Email OTP directly to student's inbox
      const emailResult = await sendPasswordResetEmail({
        to: targetEmail,
        studentName: student.name,
        studentNumber: student.student_number,
        resetCode,
        resetLink: fullResetLink,
      });

      return res.json({
        success: true,
        message: `A 6-digit verification code has been sent directly to your email (${maskedContact})! Please check your inbox.`,
        studentNumber: student.student_number,
        email: targetEmail,
        maskedContact,
        deliveryMethod: 'email',
        emailSent: emailResult.sent,
        emailError: emailResult.error || null,
        expiresIn: '60 minutes',
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to process password reset request' });
    }
  },

  // POST /api/auth/reset-password
  async resetPassword(req: Request, res: Response) {
    try {
      const { studentNumber, token, newPassword } = req.body;

      if (!studentNumber || !token) {
        return res.status(400).json({ success: false, error: 'Student number and reset code are required' });
      }

      const cleanNum = String(studentNumber).trim();
      const cleanToken = String(token).trim();
      const cleanNewPassword = newPassword !== undefined && newPassword !== null ? String(newPassword).trim() : '';

      if (!cleanNewPassword || cleanNewPassword.length < 4) {
        return res.status(400).json({ success: false, error: 'New password must be at least 4 characters long' });
      }

      // Verify token
      const validStudent = await db.students.verifyResetToken(cleanNum, cleanToken);
      if (!validStudent) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired password reset link/token. Please request a new link.',
        });
      }

      // Update password in database
      await db.students.resetPassword(cleanNum, cleanNewPassword);

      return res.json({
        success: true,
        message: 'Password successfully updated! You can now sign in with your new password.',
        studentNumber: cleanNum,
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to reset password' });
    }
  },

  // POST /api/auth/reset-password-by-id
  async resetPasswordById(req: Request, res: Response) {
    try {
      const { studentNumber, idNumber, newPassword } = req.body;

      if (!studentNumber || !idNumber) {
        return res.status(400).json({
          success: false,
          error: 'TUT student number and South African ID number are required.',
        });
      }

      const cleanNum = String(studentNumber).trim();
      const cleanId = String(idNumber).trim().replace(/\s+/g, '');
      const cleanNewPassword = newPassword !== undefined && newPassword !== null ? String(newPassword).trim() : '';

      if (cleanId.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid South African ID number (13 digits) or passport number.',
        });
      }

      if (!cleanNewPassword || cleanNewPassword.length < 4) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 4 characters long.',
        });
      }

      const result = await db.students.verifyIdentityAndResetPassword(cleanNum, cleanId, cleanNewPassword);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Failed to verify identity. Please check your credentials.',
        });
      }

      return res.json({
        success: true,
        message: 'Identity verified successfully! Your password has been updated. You can now sign in.',
        studentNumber: cleanNum,
      });
    } catch (err: any) {
      console.error('Reset password by ID error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to reset password' });
    }
  },

  // GET /api/auth/me
  async me(req: Request, res: Response) {
    try {
      const studentNum = ((req.headers['x-student-id'] as string) || (req.query.student_number as string) || '230099774').trim();
      const student = await db.students.findByStudentNumber(studentNum);

      if (student) {
        const initials = String(student.name)
          .split(' ')
          .map((p: string) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'ST';

        return res.json({
          success: true,
          user: {
            id: `tut-${student.student_number}`,
            name: student.name,
            studentNumber: student.student_number,
            email: student.email,
            phoneNumber: student.phone_number || '',
            institution: 'Tshwane University of Technology',
            department: 'Computer Systems Engineering',
            monthlyAllowance: Number(student.monthly_allowance) || 3500,
            avatarInitials: initials,
          },
        });
      }

      return res.json({
        success: true,
        user: { ...DEMO_STUDENT, phoneNumber: '0710000000' },
      });
    } catch (err: any) {
      return res.json({ success: true, user: DEMO_STUDENT });
    }
  },
};



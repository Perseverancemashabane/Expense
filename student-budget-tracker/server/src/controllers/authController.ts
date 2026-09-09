import { Request, Response } from 'express';

const DEMO_STUDENT = {
  id: 'tut-230099774',
  name: 'Naledi Perseverance Mashabane',
  studentNumber: '230099774',
  email: '230099774@tut4life.ac.za',
  institution: 'Tshwane University of Technology',
  department: 'Computer Systems Engineering',
  monthlyAllowance: 3500,
  avatarInitials: 'NM',
};

export const authController = {
  // POST /api/auth/login
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username) {
        return res.status(400).json({ success: false, error: 'Student number or email is required' });
      }

      const cleanId = String(username).trim().toLowerCase();

      // Demo Student Match
      if (
        cleanId === '230099774' ||
        cleanId === 'naledimashabane001@gmail.com' ||
        cleanId.includes('230099774') ||
        cleanId === 'admin'
      ) {
        return res.json({
          success: true,
          message: 'Student authenticated successfully',
          user: DEMO_STUDENT,
          token: 'tut-session-token-demo',
        });
      }

      // Generic Student Match (e.g. any numeric student number or email)
      const isEmail = cleanId.includes('@');
      const studentNum = isEmail ? cleanId.split('@')[0] : cleanId;
      const initials = studentNum.slice(0, 2).toUpperCase();

      const studentUser = {
        id: `tut-${studentNum}`,
        name: `Student ${studentNum}`,
        studentNumber: studentNum,
        email: isEmail ? cleanId : `${studentNum}@tut4life.ac.za`,
        institution: 'Tshwane University of Technology',
        department: 'Computer Systems Engineering',
        monthlyAllowance: 3500,
        avatarInitials: initials,
      };

      return res.json({
        success: true,
        message: 'Student authenticated successfully',
        user: studentUser,
        token: `tut-session-token-${studentNum}`,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Authentication failed' });
    }
  },

  // POST /api/auth/register
  async register(req: Request, res: Response) {
    try {
      const { name, studentNumber, email, monthlyAllowance } = req.body;
      if (!name || !studentNumber) {
        return res.status(400).json({ success: false, error: 'Full name and student number are required' });
      }

      const initials = String(name)
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ST';

      const newUser = {
        id: `tut-${String(studentNumber).trim()}`,
        name: String(name).trim(),
        studentNumber: String(studentNumber).trim(),
        email: email ? String(email).trim() : `${String(studentNumber).trim()}@tut4life.ac.za`,
        institution: 'Tshwane University of Technology',
        department: 'Computer Systems Engineering',
        monthlyAllowance: Number(monthlyAllowance) || 3500,
        avatarInitials: initials,
      };

      return res.json({
        success: true,
        message: 'Student account created successfully',
        user: newUser,
        token: `tut-session-token-${newUser.studentNumber}`,
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
    }
  },

  // GET /api/auth/me
  async me(req: Request, res: Response) {
    return res.json({
      success: true,
      user: DEMO_STUDENT,
    });
  },
};


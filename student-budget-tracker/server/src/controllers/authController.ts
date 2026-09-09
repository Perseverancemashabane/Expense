import { Request, Response } from 'express';
import { db } from '../config/db';

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

      const cleanId = String(username).trim();
      const cleanIdLower = cleanId.toLowerCase();

      // 1. Check database for registered student
      let student = await db.students.findByStudentNumber(cleanId);
      if (!student && cleanIdLower.includes('@')) {
        student = await db.students.findByEmail(cleanIdLower);
      }

      if (student) {
        // Verify PIN / Password if supplied
        const pin = student.password_pin || '1234';
        const enteredPin = password ? String(password).trim() : '';
        if (enteredPin && enteredPin !== pin && enteredPin !== '1234') {
          return res.status(401).json({ success: false, error: 'Incorrect PIN. Try 1234 or your registered PIN.' });
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

      // 2. Demo Student fallback for Naledi
      if (
        cleanIdLower === '230099774' ||
        cleanIdLower === 'naledimashabane001@gmail.com' ||
        cleanIdLower.includes('230099774') ||
        cleanIdLower === 'admin'
      ) {
        // Ensure Naledi is recorded in DB
        await db.students.create({
          name: DEMO_STUDENT.name,
          student_number: DEMO_STUDENT.studentNumber,
          email: DEMO_STUDENT.email,
          password_pin: '1234',
          monthly_allowance: 3500,
        });

        return res.json({
          success: true,
          message: 'Student authenticated successfully',
          user: DEMO_STUDENT,
          token: 'tut-session-token-demo',
        });
      }

      // 3. If student number format provided, create student profile in database
      const isEmail = cleanIdLower.includes('@');
      const studentNum = isEmail ? cleanIdLower.split('@')[0] : cleanId;
      const initials = studentNum.slice(0, 2).toUpperCase();
      const email = isEmail ? cleanIdLower : `${studentNum}@tut4life.ac.za`;
      const name = `Student ${studentNum}`;

      const created = await db.students.create({
        name,
        student_number: studentNum,
        email,
        password_pin: password ? String(password).trim() : '1234',
        monthly_allowance: 3500,
      });

      // Initialize default isolated budget for new student
      await db.budgets.upsert('2026-09', 3500, 'Monthly allowance', studentNum);

      const studentUser = {
        id: `tut-${created.student_number}`,
        name: created.name,
        studentNumber: created.student_number,
        email: created.email,
        institution: 'Tshwane University of Technology',
        department: 'Computer Systems Engineering',
        monthlyAllowance: Number(created.monthly_allowance) || 3500,
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
      const { name, studentNumber, email, password, monthlyAllowance } = req.body;
      if (!name || !studentNumber) {
        return res.status(400).json({ success: false, error: 'Full name and student number are required' });
      }

      const cleanNum = String(studentNumber).trim();
      const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanNum}@tut4life.ac.za`;
      const cleanName = String(name).trim();
      const allowance = Number(monthlyAllowance) || 3500;

      // 1. Create student in database
      const student = await db.students.create({
        name: cleanName,
        student_number: cleanNum,
        email: cleanEmail,
        password_pin: password ? String(password).trim() : '1234',
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
            institution: 'Tshwane University of Technology',
            department: 'Computer Systems Engineering',
            monthlyAllowance: Number(student.monthly_allowance) || 3500,
            avatarInitials: initials,
          },
        });
      }

      return res.json({
        success: true,
        user: DEMO_STUDENT,
      });
    } catch (err: any) {
      return res.json({ success: true, user: DEMO_STUDENT });
    }
  },
};



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email and password' });
  }

  try {
    // Check if email already exists
    const checkEmail = await db.query('SELECT id FROM students WHERE email = $1', [email.trim().toLowerCase()]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO students (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, name, email`,
      [name.trim(), email.trim().toLowerCase(), hash]
    );

    const student = result.rows[0];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET environment variable is missing.');
      return res.status(500).json({ error: 'Internal configuration error.' });
    }

    const token = jwt.sign(
      { id: student.id, name: student.name, email: student.email, role: 'student' },
      secret,
      { expiresIn: '30d' }
    );

    res.status(201).json({ token, student: { name: student.name, email: student.email } });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const result = await db.query('SELECT * FROM students WHERE email = $1', [email.trim().toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const student = result.rows[0];
    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL: JWT_SECRET environment variable is missing.');
      return res.status(500).json({ error: 'Internal configuration error.' });
    }

    const token = jwt.sign(
      { id: student.id, name: student.name, email: student.email, role: 'student' },
      secret,
      { expiresIn: '30d' }
    );

    res.json({ token, student: { name: student.name, email: student.email } });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.student is set by middleware
    const result = await db.query('SELECT id, name, email, created_at FROM students WHERE id = $1', [req.student.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ student: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

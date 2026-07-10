const db = require('../config/db');

exports.submitFeedback = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please provide name, email, subject, and message' });
  }

  try {
    const result = await db.query(
      `INSERT INTO feedbacks (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, subject, message]
    );
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: result.rows[0] });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM feedbacks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch feedbacks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteFeedback = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM feedbacks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully', feedback: result.rows[0] });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

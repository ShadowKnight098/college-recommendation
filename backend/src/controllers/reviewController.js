const db = require('../config/db');

exports.submitReview = async (req, res) => {
  const { collegeId, rating, comment, postAnonymously } = req.body;
  const studentId = req.student.id; // From middleware

  if (!collegeId || !rating || !comment) {
    return res.status(400).json({ error: 'Please provide collegeId, rating and comment' });
  }

  const numericRating = parseInt(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  try {
    // Check if college exists
    const colCheck = await db.query('SELECT id FROM colleges WHERE id = $1', [collegeId]);
    if (colCheck.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    const postAnon = postAnonymously === true;

    await db.query(
      `INSERT INTO college_reviews (college_id, student_id, rating, comment, approved, post_anonymously)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [collegeId, studentId, numericRating, comment.trim(), false, postAnon]
    );

    res.status(201).json({
      message: 'Review submitted successfully! It will appear on the site once approved by an administrator.'
    });
  } catch (error) {
    // Handle uniqueness constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ error: 'You have already submitted a review for this college.' });
    }
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getApprovedReviewsForCollege = async (req, res) => {
  const { collegeId } = req.params;
  try {
    const result = await db.query(
      `SELECT r.id, r.rating, r.comment, r.post_anonymously, r.created_at, s.name as student_name
       FROM college_reviews r
       JOIN students s ON r.student_id = s.id
       WHERE r.college_id = $1 AND r.approved = true
       ORDER BY r.created_at DESC`,
      [collegeId]
    );

    const processed = result.rows.map(row => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      studentName: row.post_anonymously ? 'Anonymous Student' : row.student_name
    }));

    res.json({ reviews: processed });
  } catch (error) {
    console.error('Get approved reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.rating, r.comment, r.post_anonymously, r.created_at, 
              s.name as student_name, s.email as student_email,
              c.name as college_name, c.code as college_code
       FROM college_reviews r
       JOIN students s ON r.student_id = s.id
       JOIN colleges c ON r.college_id = c.id
       WHERE r.approved = false
       ORDER BY r.created_at ASC`
    );
    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.approveReview = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE college_reviews SET approved = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review approved successfully' });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.rejectReview = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM college_reviews WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review rejected and deleted successfully' });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

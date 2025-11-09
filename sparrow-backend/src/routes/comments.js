const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create comment
router.post('/', authenticateToken, async (req, res) => {
  const { pdf_id, content, page_number, x_position, y_position } = req.body;

  if (!pdf_id || !content || page_number === undefined || x_position === undefined || y_position === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Verify PDF exists and user has access
    const pdfCheck = await pool.query(
      'SELECT * FROM pdfs WHERE id = $1 AND user_id = $2',
      [pdf_id, req.user.userId]
    );

    if (pdfCheck.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not found or access denied' });
    }

    const result = await pool.query(
      `INSERT INTO comments (pdf_id, user_id, content, page_number, x_position, y_position)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [pdf_id, req.user.userId, content, page_number, x_position, y_position]
    );

    const comment = result.rows[0];

    // Get user name for response
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.userId]);
    comment.user_name = userResult.rows[0].name;

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error creating comment' });
  }
});

// Get comments for a PDF
router.get('/pdf/:pdfId', authenticateToken, async (req, res) => {
  const { pdfId } = req.params;

  try {
    // Verify PDF exists and user has access
    const pdfCheck = await pool.query(
      'SELECT * FROM pdfs WHERE id = $1 AND user_id = $2',
      [pdfId, req.user.userId]
    );

    if (pdfCheck.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not found or access denied' });
    }

    const result = await pool.query(
      `SELECT c.*, u.name as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.pdf_id = $1
       ORDER BY c.created_at ASC`,
      [pdfId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error fetching comments' });
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content, x_position, y_position } = req.body;

  try {
    // Verify comment exists and user owns it
    const commentCheck = await pool.query(
      'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }
    if (x_position !== undefined) {
      updates.push(`x_position = $${paramCount++}`);
      values.push(x_position);
    }
    if (y_position !== undefined) {
      updates.push(`y_position = $${paramCount++}`);
      values.push(y_position);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE comments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Get user name for response
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.userId]);
    const comment = result.rows[0];
    comment.user_name = userResult.rows[0].name;

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Server error updating comment' });
  }
});

// Toggle comment resolved status
router.patch('/:id/resolve', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify comment exists and user owns the PDF
    const commentCheck = await pool.query(
      `SELECT c.* FROM comments c
       JOIN pdfs p ON c.pdf_id = p.id
       WHERE c.id = $1 AND p.user_id = $2`,
      [id, req.user.userId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    const result = await pool.query(
      `UPDATE comments
       SET is_resolved = NOT is_resolved, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    // Get user name for response
    const comment = result.rows[0];
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [comment.user_id]);
    comment.user_name = userResult.rows[0].name;

    res.json(comment);
  } catch (error) {
    console.error('Toggle resolve error:', error);
    res.status(500).json({ error: 'Server error toggling comment resolution' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify comment exists and user owns it
    const commentCheck = await pool.query(
      'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error deleting comment' });
  }
});

module.exports = router;

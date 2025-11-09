const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../database');
const { authenticateToken, authenticateTokenFlexible } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Upload PDF
router.post('/upload', authenticateToken, upload.single('pdf'), async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!file) {
    return res.status(400).json({ error: 'PDF file is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO pdfs (title, filename, filepath, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, file.originalname, file.filename, req.user.userId]
    );

    res.status(201).json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      filename: result.rows[0].filename,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    // Delete uploaded file if database insertion fails
    if (file) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: 'Server error during PDF upload' });
  }
});

// Get all PDFs for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, filename, created_at FROM pdfs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get PDFs error:', error);
    res.status(500).json({ error: 'Server error fetching PDFs' });
  }
});

// Get single PDF by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM pdfs WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get PDF error:', error);
    res.status(500).json({ error: 'Server error fetching PDF' });
  }
});

// Download PDF
router.get('/:id/download', authenticateTokenFlexible, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM pdfs WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdf = result.rows[0];
    const filepath = path.join(uploadsDir, pdf.filepath);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.download(filepath, pdf.filename);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ error: 'Server error downloading PDF' });
  }
});

// Delete PDF
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM pdfs WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdf = result.rows[0];
    const filepath = path.join(uploadsDir, pdf.filepath);

    // Delete file from filesystem
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete from database (comments will be deleted via CASCADE)
    await pool.query('DELETE FROM pdfs WHERE id = $1', [id]);

    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({ error: 'Server error deleting PDF' });
  }
});

module.exports = router;

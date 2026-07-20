const path = require('path');
const db = require('../config/database');
const config = require('../config');

const uploadsDir = path.resolve(config.upload.uploadDir);

const fileController = {
  async serveFile(req, res) {
    try {
      const { type, id } = req.params;
      const fileId = parseInt(id);
      if (!fileId) return res.status(400).json({ error: 'Invalid file ID' });

      let absolutePath;
      if (type === 'submission') {
        const fileResult = await db.query(
          'SELECT * FROM submission_files WHERE id = $1',
          [fileId]
        );
        if (fileResult.rows.length === 0) return res.status(404).json({ error: 'File not found' });
        const fileRecord = fileResult.rows[0];

        const subResult = await db.query(
          'SELECT * FROM submissions WHERE id = $1 AND deleted_at IS NULL',
          [fileRecord.submission_id]
        );
        if (subResult.rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
        const submission = subResult.rows[0];

        const assignResult = await db.query(
          'SELECT * FROM assignments WHERE id = $1 AND deleted_at IS NULL',
          [submission.assignment_id]
        );
        if (assignResult.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
        const assignment = assignResult.rows[0];

        if (req.user.role === 'student' && submission.student_id !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (req.user.role === 'teacher' && assignment.teacher_id !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }

        absolutePath = path.resolve(fileRecord.file_path);
      } else if (type === 'attachment') {
        const fileResult = await db.query(
          'SELECT * FROM assignment_attachments WHERE id = $1',
          [fileId]
        );
        if (fileResult.rows.length === 0) return res.status(404).json({ error: 'File not found' });
        const fileRecord = fileResult.rows[0];

        const assignResult = await db.query(
          'SELECT * FROM assignments WHERE id = $1 AND deleted_at IS NULL',
          [fileRecord.assignment_id]
        );
        if (assignResult.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
        const assignment = assignResult.rows[0];

        if (req.user.role === 'teacher' && assignment.teacher_id !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }

        absolutePath = path.resolve(fileRecord.file_path);
      } else {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      if (!absolutePath.startsWith(uploadsDir)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.sendFile(absolutePath);
    } catch (err) {
      res.status(500).json({ error: 'Failed to serve file' });
    }
  },
};

module.exports = fileController;

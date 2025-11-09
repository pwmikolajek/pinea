const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Serve static files from downloads directory
app.use('/downloads', express.static(downloadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pinea backend is running' });
});

// Check if yt-dlp is installed
app.get('/api/check-ytdlp', async (req, res) => {
  const ytdlp = spawn('yt-dlp', ['--version']);

  let output = '';
  ytdlp.stdout.on('data', (data) => {
    output += data.toString();
  });

  ytdlp.on('close', (code) => {
    if (code === 0) {
      res.json({ installed: true, version: output.trim() });
    } else {
      res.json({
        installed: false,
        message: 'yt-dlp is not installed. Please install it using: brew install yt-dlp (macOS) or visit https://github.com/yt-dlp/yt-dlp'
      });
    }
  });

  ytdlp.on('error', (err) => {
    res.json({
      installed: false,
      message: 'yt-dlp is not installed. Please install it using: brew install yt-dlp (macOS) or visit https://github.com/yt-dlp/yt-dlp'
    });
  });
});

// Download video endpoint
app.post('/api/download', async (req, res) => {
  const { url, format } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate YouTube URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (!youtubeRegex.test(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // Build yt-dlp command based on format
    let ytdlpArgs = [
      '--no-playlist',
      '-o', `${downloadsDir}/%(title)s.%(ext)s`,
      '--merge-output-format', 'mp4', // Force MP4 container
      '--recode-video', 'mp4', // Re-encode incompatible video codecs (VP9, etc) to H.264 for QuickTime
    ];

    switch (format) {
      case 'best':
        // Prefer MP4 container with H.264 video codec for QuickTime compatibility
        ytdlpArgs.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo+bestaudio/best');
        break;
      case '1080p':
        // Prefer 1080p in MP4 format
        ytdlpArgs.push('-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080][vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]');
        break;
      case '720p':
        // Prefer 720p in MP4 format
        ytdlpArgs.push('-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720][vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[height<=720]+bestaudio/best[height<=720]');
        break;
      case 'audio':
        ytdlpArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
        break;
      default:
        // Prefer MP4 container with H.264 video codec
        ytdlpArgs.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo+bestaudio/best');
    }

    ytdlpArgs.push(url);

    const ytdlp = spawn('yt-dlp', ytdlpArgs);

    let downloadedFile = '';
    let errorOutput = '';

    ytdlp.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);

      // Try to extract filename from merger output (final merged file)
      const mergerMatch = output.match(/\[Merger\] Merging formats into "(.+)"/);
      if (mergerMatch) {
        downloadedFile = path.basename(mergerMatch[1]);
      } else {
        // Fallback to destination line if no merger (e.g., audio-only or single format)
        const destinationMatch = output.match(/\[download\] Destination: (.+)/);
        if (destinationMatch) {
          // Only update if we haven't found a merger line yet
          if (!downloadedFile || !downloadedFile.includes('.mp4')) {
            downloadedFile = path.basename(destinationMatch[1]);
          }
        }
      }

      // Also check for the final merged file notification
      const mergedMatch = output.match(/Deleting original file (.+) \(pass -k to keep\)/);
      if (mergedMatch) {
        // The merged file would be the same name without the format code
        const originalFile = path.basename(mergedMatch[1]);
        downloadedFile = originalFile.replace(/\.f\d+\./, '.');
      }

      // Send progress updates
      const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        // In a real implementation, you'd use WebSockets or Server-Sent Events for real-time progress
        console.log(`Progress: ${progress}%`);
      }
    });

    ytdlp.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(data.toString());
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        res.json({
          success: true,
          message: 'Download complete',
          filename: downloadedFile,
          downloadUrl: downloadedFile ? `/downloads/${encodeURIComponent(downloadedFile)}` : null
        });
      } else {
        res.status(500).json({
          error: 'Download failed',
          details: errorOutput || 'Unknown error occurred'
        });
      }
    });

    ytdlp.on('error', (err) => {
      console.error('Error spawning yt-dlp:', err);
      res.status(500).json({
        error: 'Failed to execute yt-dlp',
        details: 'Make sure yt-dlp is installed: brew install yt-dlp'
      });
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'An error occurred during download',
      details: error.message
    });
  }
});

// List downloaded files
app.get('/api/downloads', (req, res) => {
  fs.readdir(downloadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to list downloads' });
    }

    const fileDetails = files.map(file => {
      const filePath = path.join(downloadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        size: stats.size,
        created: stats.birthtime,
        downloadUrl: `/downloads/${encodeURIComponent(file)}`
      };
    });

    res.json({ files: fileDetails });
  });
});

app.listen(PORT, () => {
  console.log(`Pinea backend server running on http://localhost:${PORT}`);
  console.log(`Downloads will be saved to: ${downloadsDir}`);
});

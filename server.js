// server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const sharp = require('sharp'); // For image processing

const app = express();
const PORT = 5000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the AI Image Enhancer Backend!');
});

// File upload and enhancement route
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const inputFilePath = path.join(__dirname, 'uploads', req.file.filename);
  const outputFilePath = path.join(__dirname, 'uploads', `enhanced-${req.file.filename}`);

  try {
    // Process the image with Sharp for basic enhancement
    await sharp(inputFilePath)
      .resize({ width: 1024 }) // Upscale resolution
      .sharpen() // Sharpen image to reduce blur
      .toFile(outputFilePath);

    res.status(200).json({
      message: 'Image enhanced successfully!',
      filePath: `/uploads/enhanced-${req.file.filename}`,
    });
  } catch (error) {
    console.error('Error enhancing image:', error);
    res.status(500).json({ error: 'Failed to process the image.' });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

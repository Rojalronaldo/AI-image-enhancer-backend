const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the AI Image Enhancer Backend!');
});

// Image upload & processing route
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const inputFilePath = path.join(uploadDir, req.file.filename);
  const enhancementType = req.body.enhancementType || 'default';
  const outputFilePath = path.join(uploadDir, `enhanced-${req.file.filename}`);

  try {
    let scriptPath = path.join(__dirname, '../ai_processing/ai_image_processing.py');
    let command = `"C:\\Python312\\python.exe" "${scriptPath}" "${inputFilePath}" "${outputFilePath}" "${enhancementType}"`;

    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing AI enhancement: ${error.message}`);
        return res.status(500).json({ error: 'Failed to process the image with AI.' });
      }
      res.status(200).json({
        message: 'Image enhanced successfully!',
        filePath: `/uploads/enhanced-${req.file.filename}`,
      });
    });
  } catch (error) {
    console.error('Error enhancing image:', error);
    res.status(500).json({ error: 'Failed to process the image.' });
  }
});

// Serve processed images
app.use('/uploads', express.static(uploadDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

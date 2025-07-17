const fs = require('fs').promises;
const path = require('path');

// Fixed file serving middleware
app.use('/output', express.static(path.join(__dirname, '../public/output'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filePath.endsWith('.xml')) {
      res.setHeader('Content-Type', 'application/xml');
    }
  }
}));

// Replace the HEAD handler with a more robust version
app.head('/output/*', async (req, res) => {
  try {
    // Extract path from the request
    const relativePath = req.path;
    const absolutePath = path.join(__dirname, '../public', relativePath);
    
    console.log(`HEAD request checking: ${relativePath} (${absolutePath})`);
    
    // Check if file exists using fs.stat instead of fs.access
    const stats = await fs.stat(absolutePath);
    
    if (stats.isFile()) {
      console.log(`File exists: ${absolutePath}`);
      res.setHeader('Content-Type', getContentType(absolutePath));
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).end();
    } else {
      console.log(`Path exists but is not a file: ${absolutePath}`);
      res.status(404).end();
    }
  } catch (error) {
    console.error(`File not found: ${req.path}`, error.message);
    res.status(404).end();
  }
});

// Add a direct file access endpoint
app.get('/api/file-content', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const absolutePath = path.join(__dirname, '../public', filePath);
    console.log(`Reading file: ${absolutePath}`);
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    const contentType = getContentType(absolutePath);
    
    res.setHeader('Content-Type', contentType);
    res.send(content);
  } catch (error) {
    console.error(`Error reading file: ${req.query.path}`, error);
    res.status(404).json({ error: `File not found: ${error.message}` });
  }
});

// Helper function to determine content type
function getContentType(filePath) {
  if (filePath.endsWith('.json')) {
    return 'application/json';
  } else if (filePath.endsWith('.xml')) {
    return 'application/xml';
  } else if (filePath.endsWith('.html')) {
    return 'text/html';
  } else if (filePath.endsWith('.txt')) {
    return 'text/plain';
  }
  return 'application/octet-stream';
}

app.post('/save-zip', upload.single('zipFile'), async (req, res) => {
  try {
    const zipFile = req.file;
    const extractDir = path.join(__dirname, '../public/output');
    
    // Clear previous files
    await fs.rm(extractDir, { recursive: true, force: true });
    await fs.mkdir(extractDir, { recursive: true });
    
    // Extract zip
    await extractZip(zipFile.path, { dir: extractDir });
    
    // Verify RML directory exists
    const rmlPath = path.join(extractDir, 'RML');
    await fs.mkdir(rmlPath, { recursive: true });
    
    // Wait and verify files
    await new Promise(resolve => setTimeout(resolve, 2000));
    const files = await fs.readdir(rmlPath);
    
    console.log('Extracted files in RML:', files);

    res.json({
      success: true,
      zipPath: `/output/${zipFile.filename}`,
      extractedTo: '/output/',
      files: files.map(f => `/output/RML/${f}`)
    });
  } catch (error) {
    console.error('Error handling zip:', error);
    res.status(500).json({ error: error.message });
  }
});

// Improved list-extracted-files endpoint
app.get('/list-extracted-files', async (req, res) => {
  try {
    const outputDir = path.join(__dirname, '../public/output');
    console.log(`Listing files in: ${outputDir}`);
    
    // Use recursive directory listing
    async function listFilesRecursively(dir, baseDir = '') {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      let files = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(baseDir, entry.name).replace(/\\/g, '/');
        
        if (entry.isDirectory()) {
          const subFiles = await listFilesRecursively(fullPath, relativePath);
          files = [...files, ...subFiles];
        } else {
          files.push(`/output/${relativePath}`);
        }
      }
      return files;
    }
    
    // Get actual files in the directory
    let allFiles = [];
    try {
      allFiles = await listFilesRecursively(outputDir);
    } catch (err) {
      console.error(`Error listing files: ${err.message}`);
    }
    
    // Log the result
    console.log(`Found ${allFiles.length} files:`, allFiles);
    
    // Return the list of files
    res.json({
      files: allFiles,
      count: allFiles.length
    });
  } catch (error) {
    console.error(`Error in list-extracted-files: ${error.message}`);
    res.json({ files: [] });
  }
});

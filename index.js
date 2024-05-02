const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const db = require('./app/config/database');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 9001;

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ncfnexus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
app.use(bodyParser.json());
app.use('/assets', express.static('assets'));

// Define storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/pdfs');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// Initialize multer upload
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  // Log the uploaded file and request body
  console.log('Uploaded file:', req.file);
  console.log('Request body:', req.body);
  return res.json({ status: 'Success' });
});

// Route for uploading research data
app.post('/create', upload.single('file'), (req, res) => {
  const { title, user_id, publish_date, abstract, department_id, category_id } = req.body;
  
  // Validate request body fields
  if (!title || !user_id || !publish_date || !abstract || !department_id || !category_id || !req.file) {
    return res.status(400).json({ error: 'Missing required fields in the request body' });
  }

  // Insert research details into the pending_researches table
  const researchValues = [title, user_id, publish_date, abstract, department_id, category_id, req.file.filename];
  const sqlResearch = "INSERT INTO pending_researches (title, user_id, publish_date, abstract, department_id, category_id, file_name) VALUES (?, ?, ?, ?, ?, ?, ?)";
  
  db.query(sqlResearch, researchValues, (err, result) => {
    if (err) {
      console.error('Error creating research:', err);
      return res.status(500).json({ error: 'Error creating research' });
    }

    console.log('Research created successfully');
 
      console.log('Research linked with author successfully');
      return res.json({ status: 'Success' });
    });
  });


// Route for approving pending uploads
app.put('/approve/:id', (req, res) => {
  const id = req.params.id;
  const sqlSelect = 'SELECT * FROM pending_researches WHERE id = ?';

  db.query(sqlSelect, id, (err, result) => {
    if (err) {
      console.error('Error fetching pending research:', err);
      return res.status(500).json({ error: 'Error fetching pending research' });
    } else if (result.length === 0) {
      return res.status(404).json({ error: 'Pending research not found' });
    }

    const research = result[0];
    const sqlInsertResearch = 'INSERT INTO researches (title, user_id, publish_date, abstract, department_id, category_id, file_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const valuesResearch = [research.title, research.user_id, research.publish_date, research.abstract, research.department_id, research.category_id, research.file_name, 'approved'];

    db.query(sqlInsertResearch, valuesResearch, (err, result) => {
      if (err) {
        console.error('Error approving research:', err);
        return res.status(500).json({ error: 'Error approving research' });
      }
      console.log('Research approved and moved to researches table:', result);
      const researchId = result.insertId;

      // Insert into research_authors table
      const sqlInsertResearchAuthor = 'INSERT INTO authors (researches_id, user_id) VALUES (?, ?)';
      const valuesResearchAuthor = [researchId, research.user_id];

      db.query(sqlInsertResearchAuthor, valuesResearchAuthor, (err, result) => {
        if (err) {
          console.error('Error linking research with author:', err);
          return res.status(500).json({ error: 'Error linking research with author' });
        }

        console.log('Research linked with author successfully');
        const sqlDelete = 'DELETE FROM pending_researches WHERE id = ?';
        db.query(sqlDelete, id, (err, result) => {
          if (err) {
            console.error('Error deleting pending research:', err);
            return res.status(500).json({ error: 'Error deleting pending research' });
          }
          console.log('Pending research deleted successfully:', result);
          return res.json({ status: 'Success' });
        });
      });
    });
  });
});




app.put('/decline/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Delete the pending research from the pending_researches table
    const sqlDelete = "DELETE FROM pending_researches WHERE id = ?";
    await db.query(sqlDelete, [id]);
    return res.status(200).json({ status: 'Success' });
  } catch (error) {
    console.error('Error declining research:', error);
    return res.status(500).json({ error: 'Error declining research' });
  }
});

app.get('/view/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Fetch the pending research from the pending_researches table
    const sqlSelect = "SELECT * FROM pending_researches WHERE id = ?";
    const [research] = await db.query(sqlSelect, [id]);
    return res.status(200).json(research);
  } catch (error) {
    console.error('Error viewing research:', error);
    return res.status(500).json({ error: 'Error viewing research' });
  }
});




app.get('/pending-researches', async (req, res) => {
  try {
    // Query the database to retrieve pending researches
    const sql = "SELECT * FROM pending_researches";
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching pending researches:', err);
        return res.status(500).json({ error: 'Error fetching pending researches' });
      }
      return res.json(results);
    });
  } catch (error) {
    console.error('Error fetching pending researches:', error);
    return res.status(500).json({ error: 'Error fetching pending researches' });
  }
});






// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Route to serve PDF files based on research ID
app.get('/pdf/:researchId', async (req, res) => {
  const { researchId } = req.params;

  try {
    // Query the researches table to get the file_name based on research ID
    const query = 'SELECT file_name FROM researches WHERE researches_id = ?';
    const [rows] = await pool.query(query, [researchId]);

    if (rows.length === 0) {
      // If no rows are returned or research ID not found, send 404 Not Found
      res.status(404).send('Research not found');
      return;
    }

    const file_name = rows[0].file_name;
    const filePath = path.join(__dirname, 'public', 'pdfs', file_name);

    // Check if the file exists
    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        // If file does not exist or cannot be read, send 404 Not Found
        res.status(404).send('PDF not found');
      } else {
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${file_name}"`);

        // Send the PDF file as response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      }
    });
  } catch (error) {
    console.error('Error fetching research:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Import and use routes
const UsersRoutes = require('./app/routes/user');
const RolesRoutes = require('./app/routes/roleRoutes');
const PublicationRoutes = require('./app/routes/publicationRoutes');
const DocumentRoutes = require('./app/routes/DocumentsRoutes');
const departmentRoutes = require('./app/routes/departmentRountes');
const testAPIRouter = require('./app/routes/testAPI');
const attachementRoutes = require('./app/routes/attachmentsRoutes');
const projectRoutes = require('./app/routes/ProjectRoutes');
const researchesRoutes = require('./app/routes/Researches');
const categoryRoutes = require('./app/routes/Category');
const authorsRoutes = require('./app/routes/Authors');


app.use('/api', UsersRoutes);
app.use('/api', RolesRoutes);
app.use('/api', PublicationRoutes);
app.use('/', DocumentRoutes);
app.use('/api', projectRoutes);
app.use('/testAPI', testAPIRouter);
app.use('/api', departmentRoutes);
app.use('/api', attachementRoutes);
app.use('/api', researchesRoutes);
app.use('/api', categoryRoutes);
app.use('/', authorsRoutes);


// Serve index page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/page.html');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

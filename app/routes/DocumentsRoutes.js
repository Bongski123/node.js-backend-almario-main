const bodyParser = require('body-parser');
const express = require('express');
const { authenticateToken } = require('../middleware/authenticateToken');
const router = express.Router();
const app = express();
const bcrypt =require('bcrypt');
const jwt =require ('jsonwebtoken');
const config = require('../middleware/config');
const secretKey = config.secretKey;
const path = require('path'); // Import the path module
const cors = require('cors');
const fs = require('fs'); // Import the fs module
app.use(cors());

app.use(bodyParser.json());

const db = require('../config/database');



//DOCUMENT REGISTRY

router.post('/DocuReg', async (req, res) =>{

    try {

        const {document_name, document_type, project_id} = req.body;
        

        const insertDocumentQuery = 'INSERT INTO documents (document_name, document_type,project_id) VALUES (?, ?, ?)';
        await db.promise().execute(insertDocumentQuery,[document_name, document_type, project_id]);

        res.status(201).json({ message: 'Document registered succesfully'});
    } catch (error) {

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Username is already used'});
    }
})



//GET ALL THE DOCUMENTS
router.get('/researches', (req, res) => {

    try {

        db.query(`
        SELECT
        r.researches_id,
        r.title,
        r.publish_date,
        r.abstract,
        r.file_name,
        r.status,
        dep.department_name,
        cat.category_name,
        CONCAT(u.firstName, ' ', u.lastName) AS author_name
    FROM
        researches r
    JOIN
        departments dep ON r.department_id = dep.department_id
    JOIN
        categories cat ON r.category_id = cat.category_id
    JOIN
        authors a ON r.researches_id = a.researches_id
    JOIN
        users u ON a.user_id = u.user_id;
    `, (err , result)=> {
            
            if(err){
                console.error('Error fetching items:', err);
            }else{
                res.status(200).json(result);
            }
        });
    } catch(error){

        console.error('Error loading users:', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

//GET DETAILS OF 1 Document
router.get('/researches/:id', (req, res)=> {
    let researches_id =req.params.id;
    if(!researches_id){
        return res.status(400).send({ error: true, message: 'Please provide document_id'});
    }

    try{

        db.query(` SELECT r.researches_id,
        r.title,
        r.publish_date,
        r.abstract,
        r.file_name,
        r.status,
        dep.department_name,
        cat.category_name,
        CONCAT(u.firstName, ' ', u.lastName) AS author_name,
        u.user_id
    FROM
        researches r
    JOIN
        departments dep ON r.department_id = dep.department_id
    JOIN
        categories cat ON r.category_id = cat.category_id
    JOIN
        authors a ON r.researches_id = a.researches_id
    JOIN
        users u ON a.user_id = u.user_id
    WHERE
        r.researches_id = ?;`, researches_id, (err, result)=>{

            if(err){
                console.error('Error fetcing items:', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json(result);
            }
        });
    }catch (error){
        console.error('Error loading user:', error);
        res.status(200).json({ error: 'Internal Server Error'});
    }
});





//GET DETAILS OF 1 Document
router.get('/author/:email', (req, res)=> {
    let researches_id =req.params.email;
    if(!researches_id){
        return res.status(400).send({ error: true, message: 'Please provide document_id'});
    }

    try{

        db.query(`SELECT 
        u.user_id,
        u.firstName,
        u.middleName,
        u.lastName,
        u.suffix,
        u.email,
        r.title AS research_title,
        r.publish_date,
        r.abstract,
        d.department_name,
        c.category_name,
        r.file_name,
        r.status
    FROM 
        authors a
    INNER JOIN 
        users u ON a.user_id = u.user_id
    INNER JOIN 
        researches r ON a.researches_id = r.researches_id
    INNER JOIN
        departments d ON r.department_id = d.department_id
    INNER JOIN
        categories c ON r.category_id = c.category_id
    WHERE 
        u.email = ?;
    `, researches_id, (err, result)=>{

            if(err){
                console.error('Error fetcing items:', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json(result);
            }
        });
    }catch (error){
        console.error('Error loading user:', error);
        res.status(200).json({ error: 'Internal Server Error'});
    }
});




app.use(express.static(path.join(__dirname, 'public')));

// Route to serve PDF files based on file_name
app.get('/pdf/:researches_id', (req, res) => {
  const { researches_id } = req.params;
  const filePath = path.join(__dirname, 'public', 'pdfs', researches_id);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="research.pdf"');

    // Send the PDF file as response
    res.sendFile(filePath);
  } else {
    // If file does not exist, send 404 Not Found
    res.status(404).send('PDF not found');
  }
});



//UPDATE document
router.put('/docuUpdate/:id',  async(req, res)=>{

    let project_id =req.params.id;

    const {document_name, document_type} = req.body;


    if(!project_id || !document_name || !document_type ){
        return res.status(400).send({ error: user , message: 'Please provide name, username and password'});
    }

    try{
        db.query('UPDATE documents SET document_name = ? , document_type =? WHERE document_id =?', [document_name, document_type, project_id],(err, result, field) =>{

          if(err){
            console.error('Error updating items:', err);
            res.status(500).json({ message: 'Internal Server Error'});
          } else{
            res.status(200).json(result);
          } 
        } );
    
    } catch(error){
        console.error('Error Loading User', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

//DELETE document
router.delete('/researches/:researches_id',  (req, res) => {
    let researches_id = req.params.id;

    if( !researches_id){
        return res.status(400).send({ error: true , message: 'Please provide user_id'});
    }

    try {

        db.query('DELETE FROM researches WHERE researches_id =?', researches_id,(err, result, field)=>{
            if (err){
                console.error('Error Deleting item:');
                res.status(500).json({ message: 'Internal Server Error'});
            } else{
                res.status(200).json(result);
            }
        });
    }catch(error){
        console.error('Error loading users:',error);
        res.status(500).json({error: 'Internal Server Error'});
    }

   
});


module.exports = router;
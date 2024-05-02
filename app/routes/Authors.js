const bodyParser = require('body-parser');
const express = require('express');
const { authenticateToken } = require('../middleware/authenticateToken');
const router = express.Router();
const app = express();
const bcrypt =require('bcrypt');
const jwt =require ('jsonwebtoken');
const config = require('../middleware/config');
const secretKey = config.secretKey;


const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

const db = require('../config/database');



router.post('/deptreg', async (req, res) =>{

    try {

        const {department_name} = req.body;
    
        const insertUsersQuery = 'INSERT INTO departments (department_name) VALUES (?)';
        await db.promise().execute(insertUsersQuery,[department_name]);

        res.status(201).json({ message: 'Register Department succesfully'});
    } catch (error) {

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Department is already used'});
    }



    });



//GET ALL THE USERS
router.get('/authors', (req, res) => {

    try {

        db.query(`SELECT 
        u.firstName,
        u.middleName,
        u.lastName,
        u.suffix,
        r.title AS research_title,
        r.publish_date,
        r.abstract,
        r.department_id,
        r.category_id,
        r.file_name,
        r.status
    FROM 
        authors a
    INNER JOIN 
        users u ON a.user_id = u.user_id
    INNER JOIN 
        researches r ON a.researches_id = r.researches_id;`, (err , result)=> {
            
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



router.get('/author/:id', (req, res) => {
    const authorId = req.params.id;
    
    // Fetch author details from the database
    const sqlQuery = 'SELECT * FROM authors WHERE id = ?';
    db.query(sqlQuery, [authorId], (err, result) => {
      if (err) {
        console.error('Error fetching author details:', err);
        return res.status(500).json({ error: 'Error fetching author details' });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ error: 'Author not found' });
      }
  
      const author = result[0];
      res.json(author);
    });
  });




//GET DETAILS OF 1 USER
router.get('/department/:id', authenticateToken, (req, res)=> {
    let department_id =req.params.id;
    if(!department_id){
        return res.status(400).send({ error: true, message: 'Please provide user_id'});
    }

    try{

        db.query('SELECT department_id, department_name FROM departments  WHERE department_id = ?', department_id, (err, result)=>{

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

//UPDATE USER
router.put('/departmentupdate/:id', authenticateToken, async(req, res)=>{

    let department_id =req.params.id;

    const {department_name} = req.body;


    if(!department_id || !department_name ){
        return res.status(400).send({ error: users, message: 'Please provide name, username and password'});
    }

    try{
        db.query('UPDATE departments SET department_name = ?  WHERE department_id =?', [department_name, department_id],(err, result, field) =>{

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

//DELETE USER
router.delete('/departmentDel/:id', authenticateToken, (req, res) => {
    let department_id = req.params.id;

    if( !department_id){
        return res.status(400).send({ error: true , message: 'Please provide user_id'});
    }

    try {

        db.query('DELETE FROM departments WHERE department_id =?', department_id,(err, result, field)=>{
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
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



router.post('/attachmentReg', async (req, res) =>{

    try {

        const {file_name,file_path,publication_id} = req.body;
    
        const insertUsersQuery = 'INSERT INTO attachments (file_name,file_path,publication_id) VALUES (?,?,?)';
        await db.promise().execute(insertUsersQuery,[file_name,file_path,publication_id]);

        res.status(201).json({ message: 'Register Attachement succesfully'});
    } catch (error) {

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'ducplicate files '});
    }



    });



//GET ALL THE USERS
router.get('/attachments', (req, res) => {

    try {

        db.query('SELECT file_name,docs FROM attachments', (err , result)=> {
            
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

//GET DETAILS OF 1 USER
router.get('/attachments/:id',  (req, res)=> {
    let attachment_id =req.params.id;
    if(!attachment_id){
        return res.status(400).send({ error: true, message: 'Please provide user_id'});
    }

    try{

        db.query('SELECT file_name , docs FROM attachments  WHERE attachment_id = ?', attachment_id, (err, result)=>{

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
router.put('/attachmentsUpdate/:id', authenticateToken, async(req, res)=>{

    let publication_id =req.params.id;

    const {file_name,file_path} = req.body;


    if(!publication_id || !file_name || !file_path ){
        return res.status(400).send({ error: users, message: 'Please provide name, username and password'});
    }

    try{
        db.query('UPDATE attachments SET file_name , file_path = ?  WHERE attachment_id =?', [file_name,file_path, publication_id],(err, result, field) =>{

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
router.delete('/attachments/:id', authenticateToken, (req, res) => {
    let attachment_id = req.params.id;

    if( !attachment_id){
        return res.status(400).send({ error: true , message: 'Please provide user_id'});
    }

    try {

        db.query('DELETE FROM attachments WHERE attachement_id =?', attachment_id,(err, result, field)=>{
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
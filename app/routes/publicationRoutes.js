const express = require('express');
const db = require('../config/database');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');

router.post('/PubRegister', async (req, res) =>{

    try {

        const { title ,authors,abstract,publication_type,citation,docs,id} = req.body;
    
        const insertPublicationQuery = 'INSERT INTO publication ( title, authors,abstract,publication_type,citation,docs,id) VALUES (?,?,?,?,?,?,?)';
        await db.promise().execute(insertPublicationQuery,[ title, authors,abstract,citation,publication_type,docs,id]);

        res.status(201).json({ message: 'book registered succesfully'});
    } catch (error) {

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Book is already used'});
    }


    });
    

    router.get('/publications',(req, res) => {

        try {
    
            db.query('SELECT * FROM publication INNER JOIN users ON publication.id = users.id', (err , result)=> {
                
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
    
    //get 1 publication

    router.get('/pubget1/:id', authenticateToken, (req, res)=> {
        let publication_id =req.params.id;
        if(!publication_id){
            return res.status(400).send({ error: true, messgae: 'Please provide user_id'});
        }
    
        try{
    
            db.query('SELECT publication_id, title, authors,abstract,publication_date ,publication_type,publication_year, id,project_id FROM publication WHERE publication_id = ?', publication_id, (err, result)=>{
    
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

    
//UPDATE publication
router.put('/updatepub/:id', authenticateToken, async(req, res)=>{

    let project_id =req.params.id;

    const {title, authors,abstract,publication_type,publication_year} = req.body;

    if(!project_id || !title || !authors || !abstract || !publication_type ||!publication_year ){
        return res.status(400).send({ error: role , message: 'Please provide  role_code, role_name'});
    }

    try{
        db.query('UPDATE publication SET title = ? , authors =? , abstract =?, publication_type = ? ,publication_year =? ,id =? WHERE publication_id =?', [title ,authors,abstract,publication_type, publication_year,project_id],(err, result, field) =>{

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

//delete publication
router.delete('/deletepub/:id', (req, res) => {
    let publication_id = req.params.id;

    if( !publication_id){
        return res.status(400).send({ error: true , message: 'Please provide role_id'});
    }

    try {

        db.query('DELETE FROM publication WHERE publication_id =?', publication_id,(err, result, field)=>{
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
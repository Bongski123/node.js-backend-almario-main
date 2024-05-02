const express = require('express');
const db = require('../config/database');

const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');







router.post('/ProjectRegister', async (req, res) =>{

    try {

        const {project_title,project_description,department_id,id} = req.body;
        const insertUserQuery = 'INSERT INTO projects (project_title,project_description,department_id,id) VALUES (?,?,?,?)';
        await db.promise().execute(insertUserQuery,[project_title,project_description,department_id,id]);

        res.status(201).json({ message: 'Project registered succesfully'});
    } catch (error) {

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Project is already used'});
    }



    });
    

    router.get('/projects', (req, res) => {

        try {
    
            db.query('SELECT project_title,project_description,department_id,id FROM projects', (err , result)=> {
                
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
    

    router.get('/project1/:id', authenticateToken, (req, res)=> {
        let project_id =req.params.id;
        if(!project_id){
            return res.status(400).send({ error: true, messgae: 'Please provide user_id'});
        }
    
        try{
    
            db.query('SELECT project_title,project_description,department_id,id WHERE project_id = ?', project_id, (err, result)=>{
    
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
router.put('/projectupdate/:id', authenticateToken, async(req, res)=>{

    let project_id =req.params.id;

    const {project_title,project_description,department_id} = req.body;

    if(!project_id || !project_title|| !project_description || !department_id ){
        return res.status(400).send({ error: role , message: 'Please provide  role_code, role_name'});
    }

    try{
        db.query('UPDATE projects SET  project_title =? ,project_description =? ,department_id =? WHERE project_id =?', [project_title, project_description,department_id,project_id],(err, result, field) =>{

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


router.delete('/deleteproj/:id', authenticateToken, (req, res) => {
    let project_id = req.params.id;

    if( !project_id){
        return res.status(400).send({ error: true , message: 'Please provide role_id'});
    }

    try {

        db.query('DELETE FROM projects WHERE project_id =?', project_id,(err, result, field)=>{
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
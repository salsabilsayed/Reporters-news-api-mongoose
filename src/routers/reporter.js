const express = require('express');
const router = new express.Router();
const Reporter = require('../models/reporter');
const auth = require('../middleware/auth');
const multer = require('multer');


// sign up
router.post('/reporters', async(req,res)=>{
    try{
        const reporter = new Reporter(req.body);
        const token = await reporter.generateToken();
        await reporter.save();
        res.status(200).send({reporter,token});
    }
    catch(e){
        res.status(400).send("e" + e)
    }
})

// login
router.post('/reporters/login',async(req,res)=>{
    try{
        const reporter = await Reporter.findByCredentials(req.body.email,req.body.password);
        const token = await reporter.generateToken();
        res.status(200).send({reporter,token});
    }
    catch(e){
        res.status(400).send("e" +e);
    }
})


// get all reporters
router.get('/reporters',auth, async(req,res)=>{
    try{
        const reporters = await Reporter.find({});
        res.status(200).send(reporters)
    }
    catch(e){
        res.status(500).send("e" + e)
    }
})

// get by id
router.get('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id;
        const reporter = await Reporter.findById(_id);
        if(!reporter){
            res.status(404).send('reporter not found!');
        }
        res.status(200).send(reporter);
    }
    catch(e){
        res.status(400).send(e);
    }
})

// get reporter profile
router.get('/profile',auth,async(req,res)=>{
    res.send(req.reporter);
})

// update the reporter
router.patch('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id;
        const updates = Object.keys(req.body);
        const reporter = await Reporter.findById(_id);

        if(!reporter){
            res.status(404).send('no reporter was found!')
        }
        updates.forEach(update => reporter[update] = req.body[update]);
        await reporter.save();
        res.status(200).send(reporter);
    }
    catch(e){
        res.status(400).send(e);
    }
})

//delete reporter
router.delete('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id;
        const reporter = await Reporter.findByIdAndDelete(_id);
        if(!reporter){
            res.status(404).send('no reporter was found!')
        }
        res.status(200).send(reporter);
    }
    catch(e){
        res.status(500).send(e);
    }
})

// logout
router.delete('/logout', auth,async(req,res)=>{
    try{
        req.reporter.tokens = req.reporter.tokens.filter(el =>{
            return el.token !== req.token
        })
        await req.reporter.save();
        res.status(200).send('logout successfully!')
    }
    catch(e){
        res.status(500).send(e)
    }
})

// logout from all devices
router.delete('/logoutAll',auth, async(req,res)=>{
    try{
        req.reporter.tokens = [];
        await req.reporter.save();
        res.status(200).send('logout from all devices successfully!')
    }
    catch(e){
        res.status(500).send(e); 
    }
})

// reporter image
const uploads = multer({
    limits:{
        fileSize:1000000
    },

    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg|jfif)$/)){
            cb(new Error('Sorry you must upload image'))
        }
        cb(null,true);
    }
})

router.post('/profile/image',auth,uploads.single('image'),async(req,res)=>{
    try{
        req.reporter.image = req.file.buffer;
        await req.reporter.save();
       res.send();
    }
    catch(e){
        res.status(500).send(e);
    }
})

module.exports = router;
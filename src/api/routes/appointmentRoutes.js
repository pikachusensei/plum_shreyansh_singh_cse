const express=require('express');
const multer=require('multer');
const appointmentController=require('../controllers/appointmentController');

const router=express.Router();

const upload=multer({dest:'uploads'});

router.post('/',upload.single('image'),appointmentController.parseAppointmentRequest);

module.exports=router;
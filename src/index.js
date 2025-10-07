require('dotenv').config();
const appointmentRoutes=require('./api/routes/appointmentRoutes');
const express=require ('express');

const app=express();
app.use(express.json());
const PORT=process.env.PORT || 3000;


app.use('/api/schedule',appointmentRoutes);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
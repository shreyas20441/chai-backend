import dotenv from 'dotenv'
import connectDB from './db/index.js';


dotenv.config({
    path:'./env'
})



connectDB();



// (async()=>{

//     try{
//         await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log(error)
//             throw error
//         })


//         app.listen(process.env.PORT, ()=>{
//             console.log(`the app is running on the port ${process.env.PORT}`)
//         })
        
//     }
//     catch(err){
//         console.log("Error connecting database");
//     }
    
// })()
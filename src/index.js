import dotenv from 'dotenv'
import connectDB from './db/index.js';
import {app} from './app.js';


dotenv.config({
    path:'./env'
})



connectDB()
.then(() => app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server running on the port ${process.env.PORT}`)
}))
.catch((err) => console.log(`MONGO connection failed`));



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
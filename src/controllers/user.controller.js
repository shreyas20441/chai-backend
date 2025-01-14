import {asyncHandler} from '../utils/asyncHandler.js'
import { APIError } from '../utils/APIError.js';
import {User} from '../models/user.modal.js';
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {APIResponse} from '../utils/APIResponse';


const registerUser = asyncHandler( async(req,res) =>{
     //get details from the user font end
     const {fullname, username, email, password} = req.body;
     console.log("email " + email)
     
     //check every field for validation

     if([fullname, email, username, password].some((field)=>(
        field?.trim() === "")
    )){
        throw new APIError(400, "All fields are compulsory")
     }

    const existedUser = User.findOne({
        $or: [{username, email}]
    })

    if(existedUser){
        throw new APIError(409, "User with email or usernae already exists")
    }



    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar files is required")
    }

   const avatar =   await uploadOnCloudinary(avatarLocalPath)
   const coverImage =   await uploadOnCloudinary(coverImageLocalPath)
   if(!avatar){
    throw new APIError(400,"Avatar files is required")
   }


  const user = await User.create({
     fullname,
     avatar:avatar.url,
     coverImage:coverImage?.url || "",
     email,
     password,
     username: username.toLowerCase(),
     
   })
   
   const createdUser = await User.findById(user._id).select("-passoword-refreshToken");

   //agar ye nhi aaya
   if(!createdUser){
     throw new APIError(500, "Something went wrong while registerting User")
   }


   return res.status(200).json({
       new APIResponse(200, createdUser, "User registered successfully")
   })
   

})


export  {
    registerUser,

}


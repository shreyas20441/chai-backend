import {asyncHandler} from '../utils/asyncHandler.js'
import { APIError } from '../utils/APIError.js';
import {User} from '../models/user.modal.js';
// import {uploadOnCloudinary} from "../utils/cloudinary.js"
import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import {APIResponse} from '../utils/APIResponse.js';
import jwt from 'jsonwebtoken'


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

    const existedUser = await User.findOne({
        $or: [{username, email}]
    })

    if(existedUser){
        throw new APIError(409, "User with email or username already exists")
    }

    console.log(req.files);



    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
 

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar files is required")
    }

    

   const avatar =   await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   if(!avatar){
    throw new APIError(400,"Avatar files is required no avatar")
   }


  const user = await User.create({
     fullname,
     avatar: avatar.url,
     coverImage:coverImage?.url || "",
     email,
     password,
     username: username.toLowerCase(),
     
   })
   
   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   //agar ye nhi aaya
   if(!createdUser){
     throw new APIError(500, "Something went wrong while registerting User")
   }


   return res.status(201).json(
    new APIResponse(200, createdUser, "User registered successfully")   
    )
   

})


const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken =  user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave:false});

        return{accessToken, refreshToken};

    }
    catch(err){
        throw new APIError(500, "Something went wrong while generating the access token")
    }
}

const loginUser = asyncHandler(async(req, res)=>{
    //take data from req body
    const {username, email, password} = req.body

    if(!username && !email){
        //throw api error
        throw new APIError(400, "user name and email required")

    }

    const user = await User.findOne({
        $or:[{username}, {email} ]
    })

    //if user not found
    if(!user){
        throw new APIError( 404,"User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)// that came from req.body
    
    if(!isPasswordValid){
        throw new APIError(401, "Invalid user credentials")
    }


    const {accessToken, refreshToken} =  await generateAccessAndRefreshTokens(user._id);


   const loggedInUser  = await User.findById(user._id).select("-password -refreshToken");


   const options ={
      httpOnly:true,
      secure:true
   }


   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
     new APIResponse(200,
        {
            user: loggedInUser,accessToken,refreshToken
        },
        "User loggedIn successFully"
     )
   )



     
})


const logoutUser = asyncHandler(async (req, res)=>{
    //have the access of req. user
   console.log( req.user._id)
   await User.findByIdAndUpdate(req.user._id,
    {
    $set:{
        refreshToken:undefined
    }},
    {
        new:true
    },

 
  
);

const options ={
    httpOnly:true,
    secure:true
 }

 return res.status(200)
 .clearCookie("accessToken", options)
 .clearCookie("refreshToken", options)
 .json(new APIResponse(200,{}, "User Logged Out"))
})


const RefreshAccessToken = asyncHandler(async(req, res, )=>{
    //so user is hitting th end point i have to check the token
const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //->this one is for mobile

if(!incomingRefreshToken){
    throw new APIError(401, "UnAuthorized request")
}

try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?._id);
    
    if(!user){
        throw new APIError(401, "Invalid refresh token")
    }
    
    if(incomingRefreshToken !== user?.refreshToken){
        throw new APIError(401, "Refresh token is expired or used")
    }
    
    const options = {
        httpOnly :true,
        secure:true
    }
    
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new APIResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access Token refreshed"
        )
    )
} catch (error) {
    throw new APIError(401, error?.message)
}

})


export  {
    registerUser,
    loginUser,
    logoutUser,
    RefreshAccessToken

}


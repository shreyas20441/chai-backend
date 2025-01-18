import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

import {User} from '../models/user.modal.js'


export const verifyJWT = asyncHandler(async(req, res, next)=>{

  try{
      //we can use it next for the middle ware
   const token =   req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")

   if(!token){
    throw new APIError(401, "UnAuthorized Request")
   }

   const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)



   const user = await User.findById(decodedToken._id)

   if(!user){
     throw new APIError(401, "Invalid access Token")
   }


   req.user = user;
   next();


  }catch(err){
    throw new APIError(401, err?.message || "Invalid access Token")
  }
})

import mongoose, {Schema} from "mongoose";

import JWT from "jsonwebtoken";
import bcrypt from  "bcrypt"

const UserSchema = new Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
        
    },
    avatar:{
        type:String, //cloudnary ka url use karna hai idher
        required:true,

    },
    coverImage:{
        type:String, //cloudnary ka url use karna hai idher

    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:'Video'

        }
    ],

    password:{
        type:String,
        required:[true, 'Password is required'],

    },
    refreshToken:{
        type:String,

    }


},{timestamps:true})


UserSchema.pre("save", async function(next){

    if(!this.isModified("Password")) return next() //if not modified the password then retun next()
        
    this.password = bcrypt.hash(this.password, 10)//else move to the next
    next();
})

//to check the password 
UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);

};

UserSchema.methods.generateAccessToken =  function() {
   retun JWT.sign({
        _id = this._id,
        email = this.email,
        username=this.username,
        fullName= this.fullName

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

UserSchema.methods.generateRefreshToken =  function() {

    retun JWT.sign({
        _id = this._id,
      

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)   
}
export const User = mongoose.model("User", UserSchema);
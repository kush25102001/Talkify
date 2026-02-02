import { generateToken } from "../libs/utils.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const signup=async(req,res)=>{
  console.log("controller signup hit");
  const {fullName,email,password}= req.body;
  try {
    if(!fullName || !email || !password)
       return res.status(400).json({message: "All fields are mandatory"})

    if(password.length<8)
      return res.status(400).json({message: "password should atleast 8 characters"})

    //check if email is valid: regex 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email))
      return res.status(400).json({message:"Invalid email format"});

    const user= await User.findOne({email});
    if(user)
      return res.status(400).json({message:"User already exists"});

    //hash password
    const salt= await bcrypt.genSalt(10);
    const  hashedPassword= await bcrypt.hash(password,salt);

    const newUser= new User({
      fullName,
      email,  
      password:hashedPassword,
    })

    if(newUser){
        generateToken(newUser._id,res);
        await newUser.save();
        res.status(201).json({
          _id:newUser._id,
        fullName:newUser.fullName,
        email:newUser.email,
        profilePic:newUser.profilePic,
        }); 
    }else{
      res.status(400).json({
        message:"Invalid user data"
      });
    }
  } catch (error) {
    console.log("Error in controller",error)
    res.status(500).json({message:"Internal server error"}); 
  }
}

export const login= async(req,res)=>{
  const {email,password}=req.body;
  try {
    const user=await User.findOne({email})
    if(!user)
      return res.status(400).json({message:"Invalid Credentials"});

    const isPassword= await bcrypt.compare(password,user.password)
    if(!isPassword)
      return res.status(400).json({message:"Invalid Credentials"});
    generateToken(user._id,res);

    res.status(200).json({
      _id: user._id,
      fullName:user.fullName,
      email:user.email,
      profilePic:user.profilePic
    })
  } catch (err) {
    console.log("error in login controller",err.message);
    res.status(500).json({message: "Internal Server error"});
  }
}

export const logout = async (_,res)=>{
   res.cookie("jwt","",{maxAge:0})
   res.status(200).json({message: "Logout Successful"})
}
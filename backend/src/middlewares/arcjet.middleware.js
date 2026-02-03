import { response } from 'express';
import aj from '../libs/arcjet.js';
import { isSpoofedBot } from '@arcjet/inspect';

export const arcjetProtection =async(req,res,next)=>{
  try {
    const decision = await aj.protect(req);

    if(decision.isDenied()){
       if(decision.reason.isRateLimit()){
        return res.status(429).json({message:"Too many requests - Rate limit exceeded. please try again later."});
       }
    
    else if(decision.reason.isBot()){
      return res.status(403).json({message:"Access denied - Bot traffic detected."});
    } else{
      return res.status(403).json({message:"Access denied - Suspicious traffic detected."});
    }
  }
 // check for spoofed bots

if(decision.results.some(isSpoofedBot)) {
 return res.status(403).json({
error: "Spoofed bot detected",
message: "Malicious bot activity detected.",
 });
}
  next();
} catch (error) {
    console.log("error in arcjet middleware",error);
    res.status(500).json({message:"Internal server error"});
  }
}

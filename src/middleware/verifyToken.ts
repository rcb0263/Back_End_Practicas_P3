import dotenv from "dotenv"
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
dotenv.config()

const SECRET = process.env.SECRET; 
export interface AuthRequest extends Request {
    user?: jwt.JwtPayload;
}

export const verifyToken = (req: AuthRequest,res: Response, next: NextFunction):void=>{
    const authHeader = req.headers["authorization"]; // []
    const token = authHeader && authHeader.split(" ")[1]; // () []
    if(!token){
        res.status(401).json({message: "Access token is missing"})
        return
    }

    jwt.verify(token, SECRET as string, (err, decoded)=>{
        if(err){
            res.status(401).json({message: "Access token is invalid"})
            return
        }
        req.user = decoded as JwtPayload;
        console.log(decoded)
        next();
    })
}

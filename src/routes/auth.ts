import { Router } from "express"
import { connectMongoDB, getDb } from "../mongo"
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../types";

const router = Router();
const colleccion = () => {return getDb().collection<User>('Usuarios');}

const SECRET = process.env.SECRET||""; 

type JetPayload={
    id: string,
    email: string
}

router.get("/",(req, res)=>{
    res.send("Se ha conectado a la ruta auth correctamente")
})

router.post("/register", async (req,res)=>{
    try {
        const {email, password, username} = req.body as {email: string, password:string, username:string}
        const users = colleccion()
        const exists = await users.findOne({email: email})
        if(exists){
            return res.status(400).json({message:" Ya existe"})
        }

        const passEncripta = await bcrypt.hash(password,10)
        await users.insertOne({
            email, passwordHash: passEncripta, username,
            createdAt: new Date()
        })

        res.status(201).json({message: "Usuario creado correctamente"})
    }catch (error) {
        res.status(500).json({message:error})
    }
})
router.post("/login", async (req,res)=>{
    try {
        const {email, password, username} = req.body as {email: string, password:string, username:string}
        const users = colleccion()

        const user = await users.findOne({email: email})
        if(!user) return res.status(400).json({message:" email incorrecto"})
        
        const validPass = await bcrypt.compare(password, user.passwordHash)
        if(!validPass) return res.status(201).json({message: " contraseña incorrecta"})
        
        const token = jwt.sign({id: user._id?.toString(), email: user.email}, SECRET,{
            expiresIn: "1h"
        })

        res.status(201).json({message: {email: user.email, token: "Bearer "+token}})
    } catch (error) {
        res.status(500).json({message:error})
    }
})

export default router;
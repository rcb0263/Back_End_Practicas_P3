import { Router } from "express";
import {AuthRequest, verifyToken} from "../middleware/verifyToken"
import { getDb } from "../mongo";
import { Product } from "../types";

const router = Router()
const colleccion = () => {return getDb().collection('Productos');}

router.get("/", async (req: AuthRequest,res)=>{
    try {
        const productos = await colleccion().find().toArray();
        res.status(200).json(productos);
    } catch (error) {
        res.status(404).json(error)
    }
})
router.post("/", verifyToken, async (req: AuthRequest,res)=>{
    try {
        const {name, description, price, stock} = req.body as {name: string, description:string, price:number, stock:number}
        const eMsg:string[] = []
        if(!name || typeof(name)!="string"){
            eMsg.push("name debe ser un string")
        }
        if(!description || typeof(description)!="string"){
            eMsg.push("description debe ser un string")
        }
        if(!price || typeof(price)!="number" || price<=0){
            eMsg.push("price debe ser un number mayor a 0")
        }
        if(!stock || typeof(stock)!="number"||stock<0){
            eMsg.push("stock debe ser un number mayor o igual que 0")
        }
        if(eMsg.length >0){
            res.status(400).json({message: eMsg})
        }else{
            const product:Product ={
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                stock: req.body.stock,
                createdAt: new Date()
            }
            const result = await colleccion().insertOne(product)
            res.status(201).json(result)
        }
    } catch (error) {
        res.status(404).json(error)
    }
})

export default router;
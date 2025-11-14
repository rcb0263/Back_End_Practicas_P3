import { Router } from "express";
import {AuthRequest, verifyToken} from "../middleware/verifyToken"
import { getDb } from "../mongo";
import { ObjectId } from "mongodb";
import { Cart, CartItem } from "../types";

const router = Router()
const colleccion = () => {return getDb().collection<Cart>('Carros');}
const colleccionP = () => {return getDb().collection('Productos');}

router.get("/", async (req: AuthRequest,res)=>{
    try {
        const carts = await colleccion().find().toArray();
        res.status(201).json(carts);
    } catch (error) {
        res.status(404).json(error)
    }
})

router.put("/", verifyToken, async (req: AuthRequest,res)=>{
    try {
        const {productId, quantity} = req.body as {productId: string, quantity:number}
        const eMsg:string[] = []
        if(!productId || typeof(productId)!="string"){
            eMsg.push("productId debe ser un string")
        }
        if(!quantity || typeof(quantity)!="number"){
            eMsg.push("quantity debe ser un number")
        }
        if(eMsg.length >0){
            res.status(401).json({message: eMsg})
        }else{
            const userID = new ObjectId(String(req.user!.id))
            const product = await colleccionP().findOne({_id: new ObjectId(productId)})
            if(!product){
                res.status(201).json({message: "No existe el producto"})
            }
            const cartProduct ={
                productId: new ObjectId(productId),
                quantity: quantity
            }
            const cart = await colleccion().findOne({userId: new ObjectId(userID)})
            if(cart){
                let cartItems = cart.items;
                cartItems.push(cartProduct)
                console.log("2")
                const result = await colleccion().updateOne({_id: cart._id},
                    {
                    $set: {items: cartItems}
                })
                console.log("3")
                res.status(201).json(result)
            }else{
                const nuevoCart: Cart ={
                    userId: userID,
                    items: [cartProduct]
                }
                const result = await colleccion().insertOne(nuevoCart)
                res.status(201).json(result)
            }
        }
    } catch (error) {
        res.status(404).json(error)
    }
    
})

export default router;
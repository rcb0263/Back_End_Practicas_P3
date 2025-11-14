import { Router } from "express";
import {AuthRequest, verifyToken} from "../middleware/verifyToken"
import { getDb } from "../mongo";
import { ObjectId } from "mongodb";
import { Cart, CartItem } from "../types";

const router = Router()
const colleccion = () => {return getDb().collection<Cart>('Carros');}
const colleccionP = () => {return getDb().collection('Productos');}

router.get("/", verifyToken, async (req: AuthRequest,res)=>{
    try {
        const userID = new ObjectId(String(req.user!.id))
        const cart = await colleccion().findOne({userId: new ObjectId(userID)})
        res.status(200).json(cart);
    } catch (error) {
        res.status(404).json(error)
    }
})

router.put("/", verifyToken, async (req: AuthRequest,res)=>{
    try {
        const {productId, quantity} = req.body as {productId: string, quantity:number}
        const eMsg:string[] = []
        if(!productId || typeof(productId)!="string") {eMsg.push("productId debe ser un string")}
        if(!quantity || typeof(quantity)!="number") {eMsg.push("quantity debe ser un number")}
        if(eMsg.length >0) {return res.status(400).json({message: eMsg})}
        
        const userID = new ObjectId(String(req.user!.id))
        const product = await colleccionP().findOne({_id: new ObjectId(productId)})
        if(!product){
            return res.status(404).json({message: "Product not found"})
        }
        if (product?.stock ==0 || quantity > product?.stock) {
            return res.status(400).json({ message: "Insufficient stock" });
        }
        const cartProduct: CartItem ={
            productId: new ObjectId(productId),
            quantity: quantity
        }
        const cart = await colleccion().findOne({userId: new ObjectId(userID)})
        if(cart){
            const oldItemIndex = cart.items.findIndex(i => i.productId.equals(cartProduct.productId))
            if(oldItemIndex >= 0){
                const newQuantity = cart.items[oldItemIndex].quantity + quantity;
                if (newQuantity > product.stock) {
                    return res.status(400).json({ message: "Insufficient stock" });
                }
                cart.items[oldItemIndex].quantity = newQuantity;
            }else {
                cart.items.push(cartProduct);
            }
            const result = await colleccion().updateOne(
                { _id: cart._id },  
                { $set: 
                    { items: cart.items  } 
                }
            );
            res.status(200).json(result)
        }else{
            const nuevoCart: Cart ={
                userId: userID,
                items: [cartProduct]
            }
            const result = await colleccion().insertOne(nuevoCart)
            res.status(200).json(result)
        }
    
    } catch (error) {
        res.status(404).json(error)
    }
    
})

export default router;
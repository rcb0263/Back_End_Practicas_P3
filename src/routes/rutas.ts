import { Router } from "express";
import {AuthRequest, verifyToken} from "../middleware/verifyToken"
import { getDb } from "../mongo";

const router = Router()
const colleccion = () => {return getDb().collection('Productos');}

router.get("/user", verifyToken, (req: AuthRequest,res)=>{
    res.json({
        message: "Acceso okey makei",
        user: req.user
    })
})

export default router;
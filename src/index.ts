import express from "express"
import { connectMongoDB } from "./mongo";
import rutasAuth from "./routes/auth";
import rutasApi from "./routes/rutas";

connectMongoDB();

const app = express();
app.use(express.json())
app.use('/auth', rutasAuth)
app.use('/api', rutasApi)
//Aplicar las rutas
app.listen(3000, ()=>console.log("El API se ha conectado"))
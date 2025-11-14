import express from "express"
import { connectMongoDB } from "./mongo";
import rutasAuth from "./routes/auth";
import rutasProducts from "./routes/products";
import rutasCarts from "./routes/cart";

connectMongoDB();

const app = express();
app.use(express.json())
app.use('/api/auth', rutasAuth)
app.use('/api/products', rutasProducts)
app.use('/api/cart', rutasCarts)
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});
//Aplicar las rutas
app.listen(3003, ()=>console.log("El API se ha conectado"))
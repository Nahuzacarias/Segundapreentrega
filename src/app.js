import express from "express";
import productRouter from "./routers/products.router.js";
import carritoRouter from "./routers/carrito.router.js";
import mongoose from "mongoose";
import handlebars from "express-handlebars"
import viewsRouter from "./routers/cart.router.js"
import session from 'express-session'
import MongoStore from 'connect-mongo'
//import prodhandlebars from "./src/routers/handlebars.router.js"
//import { Server } from 'socket.io';

const app = express();

// const io = new Server(serverhttp)

app.use(express.json());

app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')

//app.use(express.static('./public'))
app.use("/products", productRouter);
app.use("/api/carts", carritoRouter);
app.use('/products',viewsRouter)
//app.use('/',prodhandlebars)

//io.on('connection',async(socket)=>{
  app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017',
        dbName: 'clase19',
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }),
    secret: 'victoriasecret',
    resave: true,
    saveUninitialized: true
}))

const auth = (req, res, next) => {
  if (req.session?.user && req.session.user.username === 'admin@coderhouse.com') {
      return next()
  }
  return res.status(401).json({ status: 'fail', message: 'Auth error' })
}

app.get('/', (req, res) => res.json({ status: 'success', message: 'Que la fueza te acompañe!' }))

app.get('/products', auth, (req, res) => {
  //lectura de los prodyctos de la bd
  const products = [{ name: 'coca cola'}, { name: 'pepsi' }]
  res.render('products', {
      username: req.session.user.username,
      products: products
  })
})
app.get('/user/profile', (req, res) => {
  const user = {
      username: 'admin@coderhouse.com',
      ui_preference: 'dark',
      language: 'es',
      location: 'pe'
  }
  // res.cookie('preference', JSON.stringify(user), {signed: true}).json({ status: 'success', message: 'Cookie creada!' })
  req.session.user = user
  res.json({ status: 'success', message: 'Session creada!' })
})

app.get('/user/getpreference', (req, res) => {
  res.send(req.session.user.username)
})

app.get('/user/deletepreference', (req, res) => {
  // res.clearCookie('preference').json({ status: 'success', message: 'Cookie deleteada!' })
  req.session.destroy(err => {
      if (err) return res.json({ status: 'error', message: 'Ocurrio un error' })
      return res.json({ status: 'success', message: 'Cookie deleteada!' })
  })
})
const uri = "mongodb+srv://zacariasnahu:coder@cluster0.qnpopak.mongodb.net/";

//top-level await
try {
  await mongoose.connect(uri, {
    dbName: "ecommerce",
    
  });
  console.log("DB connected!");
  app.listen(8080, () => console.log("server running"));
//   const response = await userModel.find().explain("executionStats");
} catch (err) {
  console.log(err.message);
}

import e, { Router } from 'express'
// import { cartModel } from '../dao/models/cart.model'
import { productModel } from '../models/products.model.js'
import cartModel from '../models/cart.model.js'

const router = Router()

export const getProDuctsFromCart = async (req, res) => {
    try{
        const id = req.params.cid
        const result = await cartModel.findById(id).populate('products.products').lean()
        if (result === null){
            return {
                statusCode: 404, 
                response: {status: 'error', error: 'Not Found'}
            }
        }
        return {
            statusCode: 200,
            response: {status: 'success', payload: result}
        }
    } catch (err) {
        return {
            statusCode: 500,
            response: {status: 'error', error: err.message}
        }
    }
}


router.post('/', async (req, res) => {
    try{
        const result = await cartModel.create({})
        return res.status(200).json({status: 'success', payload: result})
        
    } catch (err){
        consolr.log(err)
        return res.status(500).json({status: 'error', error: err.message})
    }
})


router.get('/:cid', async (req, res) => {
    const result = await getProDuctsFromCart(req, res)
    return res.status(result.statusCode).json(result.response)
})


router.delete('/:cid', async (req, res) => {
    try{
        const cid = req.params.cid
        cartToUpdate = await cartModel.findById(cid)
        if (cartToUpdate === null){
            return res.status(404).json({status: 'error', error: `cart with id=${cid} not found`})
        }
        cartToUpdate.products = []
        const result = await cartModel.findByIdAndUpdate(cid, cartToUpdate, {returnDocument: 'after'})
        return res.status(200).json({status: 'success', payload: result})
    }catch (err){
        console.log(err)
        return res.status(500).json({status: 'error', error: err.message})
    }
})


router.put('/:cid', async (req, res) => {
    try{
        const cid = req.params.cid
        cartToUpdate = await cartModel.findById(cid)
        if (cartToUpdate === null){
            return res.status(404).json({status: 'error', error: `cart with id=${cid} not found`})
        }
        const products = req.body.products
        //start: validaciones el array enviado por body
        if (!products){
            return res.status(404).json({status: 'error', error: 'Field "products" is not optional'})
        }
        for (let index = 0; index < products.length; index++){
            if(!products[index].hasOwnProperty('products') || !products[index].hasOwnProperty('quantity')){
                return res.status(400).json({status: 'error', error: 'product must have a valid id and a valid quantity'})
            }
            if(typeof products[index].quantity !== 'number') {
                return res.status(400).json({status: 'error', error: 'product quantity must have a number'})
            }
            if(products[index].quantity === 0) {
                return res.status(400).json({status: 'error', error: 'product quantity cannot be 0'})
            }
            const productToAdd = await productModel.findById(products[index].product)
            if (productToAdd === null){
                return res.status(404).json({status: 'error', error: `product with id=${products[index].product} does not exists`})
            }
        }
        //end: validaciones el array enviado por body
        cartToUpdate.products = products
        const result = await cartModel.findByIdAndUpdate(cid, cartToUpdate, {returnDocument: 'after'})
        return res.status(200).json({status: 'success', payload: result})
    }catch (err){
        console.log(err)
        return res.status(500).json({status: 'error', error: err.message})
    }
})


router.post('/:cid/product/:pid', async (req, res) => {
    try{
        const cid = req.params.cid
        const pid = req.params.pid
        cartToUpdate = await cartModel.findById(cid)
        if (cartToUpdate === null){
            return res.status(404).json({status: 'error', error: `cart with id=${cid} not found`})
        }
        productToAdd = await productModel.findById(pid)
        if (productToAdd === null){
            return res.status(404).json({status: 'error', error: `product with id=${cid} not found`})
        }
        const productIndex = cartToUpdate.produts.findIndex(item => item.product == pid)
        if (productIndex > -1){
            cartToUpdate.products[productIndex].quantity += 1
        } else {
            cartToUpdate.products.push({product: pid, quantity:1})
        }
        const result = await cartModel.findByIdAndUpdate(cid, cartToUpdate, {returnDocument: 'after'})
        return res.status(200).json({status: 'success', payload: result})
    }catch (err){
        console.log(err)
        return res.status(500).json({status: 'error', error: err.message})
    }
})


router.put('/:cid/product/:pid', async (req, res) => {
    try{
        const cid = req.params.cid
        const pid = req.params.pid
        cartToUpdate = await cartModel.findById(cid)
        if (cartToUpdate === null){
            return res.status(404).json({status: 'error', error: `cart with id=${cid} not found`})
        }
        productToAdd = await productModel.findById(pid)
        if (productToAdd === null){
            return res.status(404).json({status: 'error', error: `product with id=${cid} not found`})
        }
        const quantity = req.body.quantity
        //start: validaciones de quantity enviado por body
        if(!quantity) {
            return res.status(400).json({status: 'error', error: 'Field quantity is not optional'})
        }
        if(typeof quantity !== 'number') {
            return res.status(400).json({status: 'error', error: 'product quantity must be a number'})
        }
        if(quantity === 0) {
            return res.status(400).json({status: 'error', error: 'product quantity cannot be 0'})
        }
        const productIndex = cartToUpdate.products.findIndex(item => item.product == pid)
        if(productIndex === -1) {
            return res.status(400).json({status: 'error', error: `product with id=${cid} not found in cart with id=${cid}`})
        } else{
            cartToUpdate.products[productIndex].quantity = quantity
        }
        //end: validaciones de quantity enviado por body
        const result = await cartModel.findByIdAndUpdate(cid, cartToUpdate, {returnDocument: 'after'})
        return res.status(200).json({status: 'success', payload: result})
    }catch (err){
        console.log(err)
        return res.status(500).json({status: 'error', error: err.message})
    }
})


router.delete('/:cid/product/:pid', async (req, res) => {
    try{
        const cid = req.params.cid
        const pid = req.params.pid
        cartToUpdate = await cartModel.findById(cid)
        if (cartToUpdate === null){
            return res.status(404).json({status: 'error', error: `cart with id=${cid} not found`})
        }
        productToDelete = await productModel.findById(pid)
        if (productToDelete === null){
            return res.status(404).json({status: 'error', error: `product with id=${cid} not found`})
        }
        const productIndex = cartToUpdate.produts.findIndex(item => item.product == pid)
        if (productIndex === -1){
            return res.status(400).json({status: 'error', error: `product with id=${cid} not found in cart with id=${cid}`})
        } else {
            cartToUpdate.products = cartToUpdate.products.filter(item => item.product.toString() !== pid)
        }
        const result = await cartModel.findByIdAndUpdate(cid, cartToUpdate, {returnDocument: 'after'})
        return res.status(200).json({status: 'success', payload: result})
    }catch (err){
        console.log(err)
        return res.status(500).json({status: 'error', error: err.message})
    }
})

export default router
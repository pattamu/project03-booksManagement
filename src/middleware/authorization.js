const {decodeToken} = require('../controller/loginController')
const bookModel = require("../models/bookModel")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId

//Make sure that only the owner of the books is able to create, edit or delete the book.
//- In case of unauthorized access return an appropirate error message.

const userAuthor = async function(req, res, next){
    try{
        let booksId, userId
        let token = req.headers['user-auth-key']
        let verifyToken = decodeToken(token)

        if(req.params.bookId !== undefined){
             booksId = req.params.bookId
             if (!ObjectId.isValid(booksId))
             return res.status(400).send ({status:false, message:"enter valid bookId"})
             userId = await bookModel.findOne({_id : booksId}).select({_id : 0, userId : 1})
             userId = userId.userId.toString()
        }
        else{
            if (Object.keys(req.body).length == 0)
           return res.status(400).send ({status:false, message:"Oops, you forgot to fill data inside request body"})
            userId = req.body.userId
            if (!ObjectId.isValid(userId))
            return res.status(400).send ({status:false, message:"enter valid userId"})
        }
        if(verifyToken.userId !== userId) return res.status(401).send({status : false, message : "Not Authorized"})

        next()
    }
    catch(error){
        res.status(500).send({status: false, message : error.message})
    }
}

module.exports = { userAuthor }
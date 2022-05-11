const {decodeToken} = require('../controller/loginController')
const bookModel = require("../models/bookModel")

//Make sure that only the owner of the books is able to create, edit or delete the book.
//- In case of unauthorized access return an appropirate error message.

const userAuthor = async function(req, res, next){
    try{
        let booksId, userId
        let token = req.headers['user-auth-key']
        let verifyToken = decodeToken(token)

        if(req.params.bookId !== undefined){
             booksId = req.params.bookId
             userId = await bookModel.findOne({_id : booksId}).select({_id : 0, userId : 1})
             userId = userId.userId.toString()
        }
        else{
            userId = req.body.userId
        }

        console.log(userId, verifyToken.userId)
        if(verifyToken.userId !== userId) return res.status(401).send({status : false, message : "Not Authorized"})

        next()
    }
    catch(error){
        res.status(500).send({status: false, message : error.message})
    }
}

module.exports = { userAuthor }
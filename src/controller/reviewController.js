const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const mongoose = require("mongoose");

const createReview = async (req,res) => {
    let bookId = req.params.bookId
    let data = req.body    

    try{
        if(!mongoose.isValidObjectId(bookId))
            return res.status(400).send({
                status: false,
                message: "Book Id is Invalid."
            })
        let findBook = await bookModel.findOne({_id:bookId,isDeleted: false})
        if(!findBook)
            return res.status(404).send({ status: false, message: "Book Not found." })

        if(!Object.keys(data).length)
            return res.status(400).send({ status: false, message: "Must provide data for creating review." })
        if(!data.reviewedBy)
            return res.status(400).send({ status: false, message: "Please enter your name under reviewedBy." })

        if(!(/^(?![\. ])[a-zA-Z\. ]+(?<! )$/).test(data.reviewedBy.trim()))
            return res.status(400).send({ status: false, message: "Please enter a Valid name." })

        if(!data.rating)
            return res.status(400).send({ status: false, message: "Please provide a rating between 1 to 5." })
        if(typeof data.rating != 'number' || data.rating<1 || data.rating>5)
            return res.status(400).send({ status: false, message: "Please enter a Valid Integer for rating between 1 to 5." })
        
        data.bookId = bookId
        data.reviewedAt = Date.now()
        await reviewModel.create(data)
        let updatedBook = await bookModel.findOneAndUpdate({_id: bookId},{$inc:{reviews: 1}},{new: true})
        res.status(201).send({
            status: true,
            message: "Review Created successfully.",
            data: updatedBook
        })
    }catch(err){
        console.log(err.message)
        res.status(500).send({ status:false, message: err.message })
    }
}

module.exports = {createReview}
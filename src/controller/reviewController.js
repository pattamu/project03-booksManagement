const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId

//Validity check function
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

// create review
const createReview = async (req, res) => {
    let bookId = req.params.bookId
    let data = req.body
    let error = []
    try {
        //checks for Invalid BookId
        if (!mongoose.isValidObjectId(bookId))
            return res.status(400).send({ status: false, message: "Book Id is Invalid." })
        //checks if BookId exists in Books collection
        let findBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!findBook)
            return res.status(404).send({ status: false, message: "Book Not found." })

        //checks if body is empty
        if (!Object.keys(data).length)
            error.push('Must provide data for creating review')

        //if reviewedBy field is empty then 'Guest' will be stored in reviewedBy 
        if (data.hasOwnProperty('reviewedBy') && !isValid(data.reviewedBy))
            delete data.reviewedBy
        //if reviewedBy is present then check if it's a valid name
        if (isValid(data.reviewedBy) && !(/^(?![\. ])[a-zA-Z\. ]+(?<! )$/).test(data.reviewedBy.trim()))
            error.push('Please enter a Valid Name')

        //checks if rating field is present
        if (!isValid(data.rating))
            error.push('Give some rating between 1 to 5')
        //check if rating is valid and bewteen 1-5, if present
        if (isValid(data.rating) && (isNaN(data.rating) || data.rating < 1 || data.rating > 5))
            error.push('Rating should be an Integer & between 1 to 5')

        //checks if error[] contains some errors
        if (error.length > 0)
            return res.status(400).send({ status: false, message: error.join(', ') })

        //adding bookId & reviewedAt Date to data obj before creation & formating reviewedBy name
        data.bookId = bookId
        data.reviewedAt = Date.now()
        data.reviewedBy = data.reviewedBy?.split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(' ') 
        await reviewModel.create(data)
        //updating reviews count in bookModel
        let updatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } }, { new: true })
        updatedBook._doc["reviewsData"] = await reviewModel.find({ bookId }, { createdAt: 0, updatedAt: 0, isDeleted: 0, __v: 0 })
        res.status(201).send({
            status: true,
            message: "Review Created successfully.",
            data: updatedBook
        })
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, message: err.message })
    }
}


//update review
const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let data = req.body
        let error = []

        //if Body is empty
        if(!Object.keys(data).length)
            return res.status(400).send({status:false, message: "Please enter some data to update the review."})

        let err = Object.keys(data).filter(x => !['review','rating','reviewedBy'].includes(x))
        if(err.length) 
            return res.status(400).send({status:false, 
                message:err.join(', ')+`${err.length>1?" are Invalid fields/can't be Updated.":" is an Invalid field/can't be Updated."}`})

        //if bookId or reviewId is invalid
        if (!ObjectId.isValid(bookId))
            error.push("enter valid bookId")
        if (!ObjectId.isValid(reviewId))
            error.push("enter valid reviewId")

        //data not found
        if (!await bookModel.findOne({ _id: bookId, isDeleted: false }))
            return res.status(404).send({ status: false, message: "book not found or it is deleted" })
        if (!await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false }))
            return res.status(404).send({ status: false, message: "review not found or it is deleted" })

        //checks if reviewedBy is empty then name won't be updated
        if (data.hasOwnProperty('reviewedBy') && !isValid(data.reviewedBy))
            delete data.reviewedBy
        //checks if reviewedBy name is valid, if present
        if (isValid(data.reviewedBy) && !(/^(?![\. ])[a-zA-Z\. ]+(?<! )$/).test(data.reviewedBy.trim()))
            error.push('Name is Invalid')
        
        //checks if rating is present and not NaN
        if (data.hasOwnProperty('rating') && (isNaN(data.rating) || !isValid(data.rating)))
            error.push('Invalid Rating: Integers only allowed')
        //checks if rating is valid 
        if (typeof data.rating=='number' && (data.rating < 1 || data.rating > 5))
            error.push('Rating should be an Integer & between 1 to 5')
        
        if (error.length > 0)
            return res.status(400).send({ status: false, message: error })

        data.reviewedBy = data.reviewedBy?.split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(' ') 
        let updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, data, { new: true })

        res.status(200).send({ status: true, message: "Review Created successfully.", data: updatedReview })

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, message: err.message })
    }
}
// delete Rewiew

const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let error = []

        //if bookId or reviewId is invalid
        if (!ObjectId.isValid(bookId))
            error.push("enter valid bookId")
        if (!ObjectId.isValid(reviewId))
            error.push("enter valid reviewId")
        if (error.length > 0)
            return res.status(400).send({ status: false, message: error })

        let checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookId)
            return res.status(404).send({ status: false, message: 'book does not exist' })

        let update = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false }, { isDeleted: true }, { new: true })

        if (!update)
            return res.status(404).send({ status: false, message: 'review with this bookid does not exist' })

        await bookModel.findOneAndUpdate({ _id: bookId }, { reviews: checkBookId.reviews - 1 }, { new: true })
        res.status(200).send({ status: true, msg: 'review sucessfully deleted', data: update })

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


module.exports = { createReview, updateReview, deleteReview }



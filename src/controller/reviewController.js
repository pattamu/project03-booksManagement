const bookModel = require("../models/bookModel")
const reviewModel=require("../models/reviewModel")
const bookModel=require("../models/bookModel")


//put api
const updateReview= async function(req,res){
    let bookId=req.params.bookId
    let reviewId=req.params.reviewId
    let data=req.body

    if(!await bookModel.findById(bookId) )
    return res.status(404).send({status:false,message:"book not found"})
    if(!await reviewModel.findById(reviewId))
    return res.status(404).send({status:false,message:"review not found"})

    let updatedReview=await reviewModel.findOneAndUpdate({_id:reviewId})

}
module.exports={updateReview}
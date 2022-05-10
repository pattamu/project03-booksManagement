<<<<<<< HEAD

//        Delete Api

const deleteBooksBYId = async function (req, res) {
    try {
      let bookId = req.params.bookId
  
      let checkBook = await bookModels.findOne({ _id: bookId, isDeleted: false })
  
      if(!checkBook){    // change -- add this for book not exist 
        return res.status(404).send({status:false,message:'book not found or already deleted'})
      }
  
      if(!(req.validToken._id == checkBook.userId)){
        return res.status(400).send({status:false,message:'unauthorized access'})
      }
  
      let updateBook = await bookModels.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
  
      res.status(200).send({ status: true, message: 'sucessfully deleted', data: updateBook })
  
    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }
  }

  module.exports.deleteBooksBYId = deleteBooksBYId
=======
const bookController = require("../models/bookModel")


//Return only book _id, title, excerpt, userId, category, releasedAt, reviews field
const getBooks = async function(req, res){
    try{
        if(Object.keys(req.query).length == 0){
            let data = await bookController.find({isDeleted : false}).select({_id : 1, title : 1, excerpt : 1, userId : 1, category : 1, releasedAt : 1, reviews : 1})
            if(!data) return res.status(404).send({status : false, message : "No books exists"})
            
            res.status(200).send({status : true, message : "Success", data : data})

        }

    //- Filter books list by applying filters. Query param can have any combination of below filters.
    // - By userId
    // - By category
    // - By subcategory
        else {
            let userId = req.query.userId
            let category = req.query.category
            let subcategory = req.query.subcategory

            let allBooks = await bookController.find({$or : [{userid : userId},{category : category}, {subcategory : subcategory}]})

            if(!allBooks) return res.status(400).send({status : false, message : "No books with selected query params"})

            let sortedBooks = allBooks.sort((a, b) => {
                let first = a.title.toUpperCase()
                let second = b.title.toUpperCase()
                if(first < second) return -1
                if(first > second) return 1
                return 0
            })

            res.status(200).send({status : true, message : "Success", data : sortedBooks})
        }
    }
    catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}


module.exports = {getBooks}
>>>>>>> 5b4e804a08419cc3e14d2ae9622dccbb21598ffd


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
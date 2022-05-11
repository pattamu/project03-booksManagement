const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const ObjectId = mongoose.Types.ObjectId

//Create Book
const createBook = async function (req, res) {
  try {
    let data = req.body
    let findTitle = await bookModel.findOne({ title: data.title }).collation({ locale: "en", strength: 2 })
    let findISBN = await bookModel.findOne({ ISBN: data.ISBN })
    let isbnRegex = /^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$/

    function isPresent(value) {
      if (!value || value.trim().length == 0)
        return false;
    }
    function badRequest() {
      let error = []

      //checks if body is empty
      if (Object.keys(data).length == 0)
        return "Oops, you forgot to fill data inside request body"

      //check if title is present
      if (!isPresent(data.title))
        error.push("title is required")
      //checks for duplicate title
      if (findTitle)
        error.push("book with same title is already present")

      //check if excerpt is present
      if (!isPresent(data.excerpt))
        error.push("excerpt is required")

      //check if userId is present
      if (!isPresent(data.userId))
        error.push("userId is required")
      //checks for valid userId
      if (!ObjectId.isValid(data.userId))
        error.push("enter valid userId")

      //check if ISBN is present
      if (!isPresent(data.ISBN))
        error.push("ISBN is required")
      //checks for valid ISBN
      if (data.ISBN && !data.ISBN.trim().match(isbnRegex))
        error.push("enter valid ISBN")
      //checks for duplicate ISBN
      if (findISBN)
        error.push("book with same ISBN is already present")

      //check if category is present
      if (!isPresent(data.category))
        error.push("category is required")

      //check if subcategory is present
      if(!data.subcategory || data.subcategory.length==0 ||data.subcategory.some(x => x.match(/[^_a-zA-Z]/)))
        error.push("subcategory is required or invalid")

      //check if releasedAt is present
      if (!isPresent(data.releasedAt))
        error.push("releasedAt is required")
      //check for releasedAt format
      if (data.releasedAt && !data.releasedAt.trim().match(/^\d{4}[-]\d{2}[-]\d{2}$/))
        error.push(`releasedAt must in "YYYY-MM-DD" format`)

      if (error.length > 0)
        return error;
    }

    if (badRequest()) {
      let err = badRequest();
      if (typeof err == "string")
        return res.status(400).send({ status: false, msg: err })
      return res.status(400).send({ status: false, msg: err.join(', ') })
    }

    if (!await userModel.findById(data.userId))
      return res.status(404).send({ status: false, message: "user not found" })
     
      data.subcategory=data.subcategory.filter(x=>x)
  
    let created = await bookModel.create(data)
    res.status(201).send({ status: true, message: "Success", data: created })
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
}


//Return only book _id, title, excerpt, userId, category, releasedAt, reviews field
const getBooks = async function (req, res) {
  try {
    if (Object.keys(req.query).length == 0) {
      let allBooks = await bookModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

      if (allBooks.length == 0)
        return res.status(404).send({ status: false, message: "No books exists" })
      return res.status(200).send({ status: true, message: "Success", data: sortedBooks })
    }
    //- Filter books list by applying filters. Query param can have any combination of below filters.
    // - By userId
    // - By category
    // - By subcategory
    else {
      let userId = req.query.userId
      let category = req.query.category
      let subcategory = req.query.subcategory

      let allBooks = await bookModel.find({ $and: [{ $or: [{ userId: userId }, { category: category }, { subcategory: subcategory }] }, { isDeleted: false }] }).sort({ title: 1 })
        .select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).collation({locale:"en",strength:2})

      if (allBooks.length == 0)
        return res.status(400).send({ status: false, message: "No books with selected query params" })

      res.status(200).send({ status: true, message: "Success", data: allBooks })
    }
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}


//Update Book API Function
const updateBook = async (req, res) => {
  let data = req.body
  let bookId = req.params.bookId
  let authUser = req.headers['valid-auth-user_id']
  let titleRegEx = /^[,.-_ a-zA-Z0-9]+$/
  let ISBN_RegEx = /^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$/

  const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
  }

  try {
    if (!mongoose.isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: "Please enter a Valid Book ObjectId." })

    let findBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!findBook)
      return res.status(404).send({ status: false, message: "There is No Book available with this bookId." })

    if (findBook.userId != authUser)
      return res.status(401).send({ status: false, message: "You don't have Authority to Update this Book." })

    if (!Object.keys(data).length)
      return res.status(400).send({ status: false, message: "Please Enter Data. Book can't be Updated without any Data." })

    if (data.title && !isValid(data.title))
      return res.status(400).send({ status: false, message: "Please Enter some data in Title." })

    if (await bookModel.findOne({ title: data.title }))
      return res.status(400).send({ status: false, message: "Book with same title is already present" })


    if (data.title && !titleRegEx.test(data.title.trim()))
      return res.status(400).send({ status: false, message: "Please Enter a valid Title for your Book." })

    if (data.ISBN && !ISBN_RegEx.test(data.ISBN.trim()))
      return res.status(400).send({ status: false, message: "Please Enter a valid ISBN for your Book." })

    let updateBook = await bookModel.findOneAndUpdate({
      _id: findBook, isDeleted: false
    }, {
      title: req.body.title,
      excerpt: req.body.excerpt,
      releasedAt: data.releasedAt,
      ISBN: req.body.ISBN
    }, {
      new: true
    })
    if (!updateBook)
      return res.status(404).send({ status: false, message: "Book Not Found." })

    res.status(200).send({ status: true, message: 'Success', data: updateBook })
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}


//        Delete Api
const deleteBooksBYId = async function (req, res) {
  try {
    let bookId = req.params.bookId
    let authUser = req.headers['valid-auth-user_id']

    let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })

    if (!checkBook) {    // change -- add this for book not exist 
      return res.status(404).send({ status: false, message: 'book not found or already deleted' })
    }

    if (authUser != checkBook.userId) {
      return res.status(400).send({ status: false, message: 'unauthorized access' })
    }

    let updateBook = await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: new Date() }, { new: true })

    res.status(200).send({ status: true, message: 'sucessfully deleted', data: updateBook })

  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
}

const getBooksReviews = async function(req, res){
  try{
    let bookId = req.params.bookId
    if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Please enter a Valid Book ObjectId." })

    let findBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!findBook) return res.status(404).send({ status: false, message: "There is No Book available with this bookId." })

    let reviews = await reviewModel.find({bookId : bookId}).select({isDeleted : 0})

    findBook = findBook.toJson()
    findBook["reviewsData"] = [...reviews]

    res.status(200).send({status : true, message : "Books List", data : findBook})


  }
  catch(error){
    res.status(500).send({status : false, message : error.message})
  }
}

module.exports = {getBooksReviews ,createBook, deleteBooksBYId, getBooks, updateBook }
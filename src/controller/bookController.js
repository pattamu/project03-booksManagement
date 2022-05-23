const mongoose = require("mongoose");
const aws = require("aws-sdk")

const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")

/*************************AWS File Upload*****************************************/

aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile= async (file) =>{
  return new Promise( function(resolve, reject) {
  // this function will upload file to aws and return the link
  let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

  var uploadParams= {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "sandeep/" + file.originalname, 
      Body: file.buffer
  }

  s3.upload( uploadParams, function (err, data ){
      if(err) {
          return reject({"error": err})
      }
      // console.log(data)
      console.log("file uploaded succesfully")
      return resolve(data.Location)
  })
})
}

function isFileImage(file) {
  let ext = ['png', 'jpg', 'jpeg']
  let fileExt = file.originalname.split('.')
  return ext.includes(fileExt[1])
}
/*********************************************************************************/
//check Validity
const isValid = (value) => {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}

//Create Book
const createBook = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body))
    let error = []
    let findTitle = await bookModel.findOne({ title: data.title }).collation({ locale: "en", strength: 2 })
    let findISBN = await bookModel.findOne({ ISBN: data.ISBN })
    let isbnRegex = /^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$/

    //check if file is present
    if(!req.files.length)
      error.push("file is required")
    //check if file is an image (Remeber 'field name' in postman is optional while uploading file)
    if(req.files.length){
      let check = isFileImage(req.files[0])
      if(!check) 
        error.push('invalid file, image only allowed')
    }
    
    //check if title is present
    if (!isValid(data.title))
      error.push("title is required")

    //checks for duplicate title
    if (findTitle)
      error.push("book with same title is already present")

    //check if excerpt is present
    if (!isValid(data.excerpt))
      error.push("excerpt is required")

    //check if ISBN is present
    if (!isValid(data.ISBN))
      error.push("ISBN is required")
    //checks for valid ISBN
    if (data.ISBN?.trim() && !data.ISBN.trim().match(isbnRegex))
      error.push("enter valid ISBN")
    //checks for duplicate ISBN
    if (findISBN)
      error.push("book with same ISBN is already present")

    //check if category is present
    if (!isValid(data.category))
      error.push("category is required")
    //checks for valid catagory
    if (data.category?.trim() && data.category.trim().match(/[^-_a-zA-Z]/))
      error.push("enter valid category")

    /***************************************************************/

    if(data.subcategory.includes('[' && ']') || data.subcategory.includes(','))
    data.subcategory = data.subcategory.split(/[",\[\]]/).filter(x=>x.trim())

    /***************************************************************/

    //checks for valid subcategory conditions
    if (data.hasOwnProperty('subcategory')) {
      if (Array.isArray(data.subcategory)) {
        if (!data.subcategory.some(x => x.trim()) || data.subcategory.some(x => x.trim().match(/[^-_a-zA-Z]/)))
          error.push('subcategory values are Invalid')
      } else if (!isValid(data.subcategory))
        error.push('subcategory is required')
      else if (data.subcategory?.trim() && data.subcategory.match(/[^-_a-zA-Z]/))
        error.push('subcategory values are Invalid')
    } else error.push('subcategory is required')

    //check if releasedAt Date is present
    if (!isValid(data.releasedAt))
      error.push("releasedAt is required")
    //check for releasedAt Date format
    if (data.releasedAt?.trim() && !data.releasedAt.trim().match(/^(19|20)\d\d[-](0[1-9]|1[0-2])[-](0[1-9]|[12][0-9]|3[01])$/))
      error.push(`enter valid date in 'YYYY-MM-DD' format`)

    if (error.length > 0)
      return res.status(400).send({ status: false, msg: error })

    if (Array.isArray(data.subcategory))
      data.subcategory = data.subcategory.filter(x => x.trim())
    data.isDeleted = false
    data.bookCover = await uploadFile( req.files[0] )//getting aws link for the uploaded file after stroing it in aws s3
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
      return res.status(200).send({ status: true, message: `Books List`, data: allBooks })
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
        .select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).collation({ locale: "en", strength: 2 })

      if (allBooks.length == 0)
        return res.status(400).send({ status: false, message: "No books with selected query params" })

      res.status(200).send({ status: true, message: `Books List`, data: allBooks })
    }
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}


//get book with params
const getBooksReviews = async function (req, res) {
  try {
    let bookId = req.params.bookId
    if (!mongoose.isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: "Please enter a Valid Book ObjectId." })

    let findBook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ __v: 0 })
    if (!findBook)
      return res.status(404).send({ status: false, message: "There is No Book available with this bookId." })

    let reviews = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })

    findBook = findBook.toJSON()
    findBook["reviewsData"] = reviews

    res.status(200).send({ status: true, message: "Books List", data: findBook })
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}


// Update Book API --->
const updateBook = async (req, res) => {
  let data = req.body
  let bookId = req.params.bookId
  // let titleRegEx = /^[-'*",._ a-zA-Z0-9]+$/
  let ISBN_RegEx = /^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$/
  let error = []

  try {
    let err = Object.keys(data).filter(x => !['title', 'excerpt', 'releasedAt', 'ISBN'].includes(x))
    if (err.length)
      return res.status(400).send({ status: false, message: err.join(', ') + `${err.length > 1 ? ' are Invalid fields.' : ' is an Invalid field.'}` })

    let findBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!findBook)
      return res.status(404).send({ status: false, message: "There is No Book available with this bookId." })

    if (!Object.keys(data).length)
      return res.status(400).send({ status: false, message: "Please Enter Data. Book can't be Updated without any Data." })

    if (data.hasOwnProperty('title') && !isValid(data.title))
      error.push("Title can't be empty")

    if (data.title?.trim() && await bookModel.findOne({ title: data.title }))
      error.push('Title is already present')

    if (data.hasOwnProperty('ISBN') && !isValid(data.ISBN))
      error.push("ISBN can't be empty")

    if (data.ISBN?.trim() && !ISBN_RegEx.test(data.ISBN.trim()))
      error.push('ISBN is Invalid')

    if (data.ISBN?.trim() && await bookModel.findOne({ ISBN: data.ISBN }))
      error.push('ISBN is already present')

    if (data.hasOwnProperty('releasedAt') && !isValid(data.releasedAt))
      error.push("releasedAt Date can't be empty")

    if (data.releasedAt?.trim() && !(/^(19|20)\d\d[-](0[1-9]|1[0-2])[-](0[1-9]|[12][0-9]|3[01])$/).test(data.releasedAt.trim()))
      error.push('releasedAt Date is Invalid')

    if (error.length > 0)
      return res.status(400).send({ status: false, message: error })

    let updateBook = await bookModel.findOneAndUpdate({
      _id: findBook, isDeleted: false
    }, {
      title: req.body.title,
      excerpt: req.body.excerpt,
      releasedAt: data.releasedAt,
      ISBN: req.body.ISBN
    }, { new: true })

    res.status(200).send({ status: true, message: 'Success', data: updateBook })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}


// Delete Book API ---> 
const deleteBooksBYId = async function (req, res) {
  try {
    let bookId = req.params.bookId

    let updateBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })

    if (!updateBook)  // change -- add this for book not exist 
      return res.status(404).send({ status: false, message: 'book not found or already deleted' })
    res.status(200).send({ status: true, message: 'sucessfully deleted', data: updateBook })

  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
}


module.exports = { getBooksReviews, createBook, deleteBooksBYId, getBooks, updateBook }
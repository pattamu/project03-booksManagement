const bookModel = require("../models/bookModel")
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const ObjectId = mongoose.Types.ObjectId

const createBook = async function (req, res) {
    try {
        let data = req.body
        let findTitle = await bookModel.findOne({ title: data.title }).collation({ locale: "en", strength: 2 })
        let findISBN = await bookModel.findOne({ ISBN: data.ISBN })
        let isbnRegex = /^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$/

        function isPresent(value) {
            if (!value || value.trim().length == 0)
                return true;
        }
        function badRequest() {
            let error = []

            //checks if body is empty
            if (Object.keys(data).length == 0)
                return "Oops, you forgot to fill data inside request body"

            //check if title is present
            if (isPresent(data.title))
                error.push("title is required")
            //checks for duplicate title
            if (findTitle)
                error.push("book with same title is already present")

            //check if excerpt is present
            if (isPresent(data.excerpt))
                error.push("excerpt is required")

            //check if userId is present
            if (isPresent(data.userId))
                error.push("userId is required")
            //checks for valid userId
            if (!ObjectId.isValid(data.userId))
                error.push("enter valid userId")

            //check if ISBN is present
            if (isPresent(data.ISBN))
                error.push("ISBN is required")
            //checks for valid ISBN
            if (data.ISBN && !data.ISBN.trim().match(isbnRegex))
                error.push("enter valid ISBN")
            //checks for duplicate ISBN
            if (findISBN)
                error.push("book with same ISBN is already present")

            //check if category is present
            if (isPresent(data.category))
                error.push("category is required")

            //check if subcategory is present
            // if (isPresent(data.subcategory))
            //     error.push("subcategory is required")

            //check if releasedAt is present
            if (isPresent(data.releasedAt))
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
            return res.status(404).send({ status: false, message: "user not found"})

        let created = await bookModel.create(data)
        res.status(201).send({ status: true, message: "Success", data: created })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createBook }
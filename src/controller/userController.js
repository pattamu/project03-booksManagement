const userModel = require("../models/userModel")

//check Validity
const isValid = (value) => {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
    }

const registerUser = async function (req, res) {
    try {
        let data = req.body
        let getPhone = await userModel.findOne({ phone: data.phone })
        let getEmail = await userModel.findOne({ email: data.email })

        function badRequest() {
            let error = []

            //checks if body is empty
            if (Object.keys(data).length == 0)
                return "Oops, you forgot to fill data inside request body"

            //check if title is present
            if (!isValid(data.title))
                error.push("title is required")
            //check for enum values
            if (data.title?.trim() && !["Mr", "Mrs", "Miss"].includes(data.title.trim()))
                error.push("title can only be Mr,Mrs or Miss")

            //checks if name is present
            if (!isValid(data.name))
                error.push("name is required")
            //checks for valid name
            if (data.name?.trim() && !data.name.trim().match(/^(?![\. ])[a-zA-Z\. ]+(?<! )$/))
                error.push("enter a valid name")

            //checks if phone is present or not
            if (!isValid(data.phone))
                error.push("phone number is required")
            //checks for valid phone number
            if (data.phone?.trim() && !data.phone.trim().match(/^(\+\d{1,3}[- ]?)?\d{10}$/))
                error.push("enter valid mobile number")
            //check unique phone number
            if (getPhone)
                error.push("mobile number is already in use")

            //check if email is present
            if (!isValid(data.email))
                error.push("email is required")
            //validate email
            if (data.email?.trim() && !data.email.trim().match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/))
                error.push("enter a valid email")
            //check for duplicate email
            if (getEmail)
                error.push("email is already in use")

            //check if password is present
            if (!isValid(data.password))
                error.push("password is required")
            //checks password length
            if (data.password?.trim() && (data.password.length < 8 || data.password.length > 15))
                error.push("password must have 8-15 characters")

            //check if address have valid pincode
            if (data.address?.pincode && !data.address.pincode.match(/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/))
                error.push("enter a valid pincode")

            if (error.length > 0)
                return error;
        }
        if (badRequest()) {
            let err = badRequest();
            if (typeof err == "string")
                return res.status(400).send({ status: false, msg: err })
            return res.status(400).send({ status: false, msg: err.join(', ')+'.' })
        }
        data.name = data.name.split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(' ') 

        let created = await userModel.create(data)
        res.status(201).send({ status: true, message: "Success", data: created })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { registerUser }
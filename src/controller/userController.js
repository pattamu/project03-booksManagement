const userModel = require("../models/usermodel")

const registerUser = async function(req, res){
    if(Object.keys(req.body).length == 0) return res.status(400).send({status : false, message : "Oops, you forgot to fill data inside request body"})

    let data = req.body

    let created = await userModel.create(data)

    res.status(201).send({status : true, message : "Success", data : created})
}

module.exports.registerUser = registerUser
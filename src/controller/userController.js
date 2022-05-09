const userModel = require("../models/usermodel")

const isValidParams = function(arr){
    let params = ["name", "title", "phone", "email", "password"]
    for(let keys of arr){
        if(params.indexOf(keys) == -1) return false
    }
    if(arr.length == 6){
        if(arr.indexOf("address") == -1) return false
    }
    return true
}

const registerUser = async function(req, res){
    try{
        if(!isValidParams(Object.keys(req.body))) return res.status(400).send({status : false, message : "Invalid Params, there might be something that should not be there"})

        if(Object.keys(req.body).length == 0) return res.status(400).send({status : false, message : "Oops, you forgot to fill data inside request body"})

        let data = req.body

        let created = await userModel.create(data)

        res.status(201).send({status : true, message : "Success", data : created})
    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}

module.exports.registerUser = registerUser
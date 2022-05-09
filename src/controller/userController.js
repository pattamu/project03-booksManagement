const userModel = require("../models/usermodel")

const registerUser = async function(req, res){
    
    let data = req.body

    function isPresent(value){
        if(!value && value.trim().length==0)
        return true;
    }

    function badRequest(){
        if(Object.keys(data).length == 0) 
    return res.status(400).send({status : false, message : "Oops, you forgot to fill data inside request body"})
        
    }

    let created = await userModel.create(data)

    res.status(201).send({status : true, message : "Success", data : created})
}

module.exports.registerUser = registerUser
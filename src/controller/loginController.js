const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const secret = process.env.JWT_SECRET || "Book Management project group-25."
const exp = process.env.JWT_EXP || '3600s'

const generateToken = (userData) => {
    return jwt.sign({
        userId: userData._id.toString(),
    },secret, {expiresIn: exp})
}

const decodeToken = (token) => {
    return jwt.verify(token,secret,(err,data) => {
        if(err)
            return null
        else 
            return data
        })
}

const userLogin = async (req,res) => {
    let data = req.body
    try{
        if(Object.keys(data).length ===2 && data.email && data.password){
            let userCheck = await userModel.findOne(data)
            if(!userCheck)
                return res.status(401).status({
                    status: false,
                    message: "invalid credentials. User doesn't exist."
                })
            let token = generateToken(userCheck)
            res.setHeader('user-auth-key', token)
            res.status(201).send({
                status: true,
                data: {
                    userId: userCheck._id.toString(),
                    token,
                    exp,
                    iat: decodeToken(token).iat
                }
            })
        }
        else
            res.status(401).send({
                status: false,
                messgae: "Please enter Valid E-mail and Password Only."
            })
    }catch(err){
        console.log(err.message)
        res.status(500).send({
            status: false,
            message: err.message
        })
    }
}

module.exports = {userLogin, decodeToken}
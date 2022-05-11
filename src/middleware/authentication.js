const {decodeToken} = require('../controller/loginController')

const userAuthentication = async (req,res,next) => {
    try{
        let token = req.headers['user-auth-key']
        if(!token) return res.status(401).send({status : false, message : "Token must be present"})

        let verifyToken = decodeToken(token)
        if(!verifyToken)
            return res.status(401).send({
                status: false,
                message: "Token is either Invalid or Expired. User Must log in with Valid details."
            })
        next()
    }catch(err){
        res.status(500).send({
            status: false,
            message: err.message
        })
    }
}

module.exports = {userAuthentication}
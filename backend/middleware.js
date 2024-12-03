const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("./config.js")

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        
        if (decoded.userId) {
            req.userId = decoded.userId;
            next()
        } else {
            res.status(403).json({})
        }
    } catch (error) {
        console.log(error)
        res.status(403).json({message: "Error"})
    }
}

module.exports = {
    authMiddleware
}
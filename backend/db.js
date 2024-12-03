const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/paytm-app?replicaSet=rs0").
then(() => {
    console.log("db connected successfully")
})
.catch((error) => {
    console.log(error)
})

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
})

const accountSchema = new mongoose.Schema({
    balance: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const User = mongoose.model("User", userSchema)
const Account = mongoose.model("Account",accountSchema)
module.exports = {User, Account}

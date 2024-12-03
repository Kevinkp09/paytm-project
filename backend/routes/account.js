const express = require('express');
const zod = require("zod")
const router = express.Router();
const {authMiddleware} = require("../middleware.js");
const { Account } = require("../db");
const { default: mongoose } = require('mongoose');

const accountBody = zod.object({
    to: zod.string(),
    amount: zod.number()
})

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        console.log("User ID from authMiddleware:", req.userId);
        const account = await Account.findOne({
            userId: req.userId
        });
        console.log(account)

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.status(200).json({ message: "Balance fetched successfully", account });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    const {amount, to} = req.body
   

    const account = await Account.findOne({
        userId: req.userId
    }).session(session)
    console.log(account)

    if (!account && account.balance < amount) {
        await session.abortTransaction()
        res.status(400).json({message: "Insufficient Balance"})
    }

    const toAccount = await Account.findOne({
        userId: to
    }).session(session)
    console.log(to)

    console.log(toAccount)
    if (!toAccount) {
        await session.abortTransaction()
        return res.status(400).json({
            message: "Invalid account"
        })
    }

    await Account.updateOne({
        userId: req.userId
    }, {
        $inc: {
            balance: -amount
        }
    }).session(session)

    await Account.updateOne({
        userId: to
    }, {
        $inc: {
            balance: amount
        }
    }).session(session)
    
    await session.commitTransaction()
    res.status(200).json({
        message: "Transfer successful"
    })
})

module.exports = router;

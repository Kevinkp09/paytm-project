
const express = require('express');
const zod = require("zod")
const jwt = require("jsonwebtoken")
const router = express.Router();
const {User, Account} = require("../db.js")
const {JWT_SECRET} = require("../config.js")
const {authMiddleware} = require("../middleware.js")
const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    fullname: zod.string()
})

const signinBody = zod.object({
    username: zod.string(),
	password: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
    
})

router.post("/signup", async (req, res) => {
    const {success} = signupSchema.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        res.status(411).json({
            message: "username already taken"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
    })

    const userId = user._id;

    const token = jwt.sign({userId}, JWT_SECRET)
    await Account.create({
        balance: 1 + Math.random() * 10000,
        userId
    })
    res.status(201).json({message: "User successfully created", token})
})

router.post("/signin", async (req,res) => {
    const {success} = signinBody.safeParse(req.body)

    if (!success) {
        return res.status(411).json({
            message: "Incorrect username or password"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if (!user) {
        return res.status(404).json({message: "User not found"})
    }

    const token = jwt.sign({
    userId: user._id
    }, JWT_SECRET)

    return res.json({message: "Successfully signed in", token})
})

router.put("/", authMiddleware,async (req, res) => {
    const {success} = updateBody.safeParse(req.body)
    if (!success) {
        return res.status(401).json({error: "You are unauthorized for this action"})
    }

    await User.updateOne({_id: req.userId}, req.body)
    return res.json({message: "Updated successfully"})
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || ""
    const users = await User.find({
        $or:[ {
            firstName: {$regex: filter}
        },
        {
            lastName: {$regex: filter}
        },
    ]
    })
    
   const userList = users.map((user) => {
    username: user.username;
    firstName: user.firstName;
    lastName: user.lastName;
    _id: user._id
   })

   return res.json({userList})
})



module.exports = router;
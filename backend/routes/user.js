const express = require("express");
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { authMiddleware } = require("../middleware");

const JWT_SECRET = process.env.JWT_SECRET;

//validation schemas

const signupSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

const signinSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const updateSchema = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

//signup and signin routes
router.post("/signup", async (req, res) => {
  const body = req.body;
  const { success } = signupSchema.safeParse(body);

  //input validation
  if (!success) {
    return res.status(400).json({
      message: "Incorrect Inputs",
    });
  }
  //check if already exists

  const user = await User.findOne({
    username: body.username,
  });

  if (user._id) {
    return res.status(411).json({
      message: "Email already taken",
    });
  }

  //create user
  const dbUser = User.create(body);

  const token = jwt.sign(
    {
      userId: dbUser._id,
    },
    JWT_SECRET
  );

  res.status(200).json({
    message: "User Created Succesfully",
    token,
  });
});

router.post("/signin", async (req, res) => {
  const { success } = signinSchema.safeParse(req.body);

  //input validation
  if (!success) {
    return res.status(411).send({
      message: "Invalid Inputs",
    });
  }

  //check the user
  const user = await User.findOne({
    username,
    password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    return res.status(200).json({
      token,
    });
  }

  return res.status(401).json({
    message: "Invalid Credentials",
  });
});

//updations of user creds/data

router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateSchema.safeParse(req.body);

  //inputs check
  if (!success) {
    res.status(411).json({
      message: "Invalid Inputs",
    });
  }

  //update user
  await User.updateOne(req.body, {
    id: req.userId,
  });

  res.json({
    message: "User details updated successfully",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  //find all users with the given filters
  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    users: users.map(({ username, firstName, lastName, _id }) => ({
      username,
      firstName,
      lastName,
      _id,
    })),
  });
});

module.exports = router;

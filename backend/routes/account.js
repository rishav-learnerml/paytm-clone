const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db");
const zod = require("zod");

const mongoose = require("mongoose");
const router = express.Router();

//input validation schemas
const transactionSchema = zod.object({
  amount: zod.number(),
  to: zod.string(),
});

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.json({
    balance: account.balance,
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  //ensure that no concurrent request get processed
  //start a transaction session
  const session = await mongoose.startSession();

  try {
    //start transaction
    session.startTransaction();
    const { amount, to } = req.body;
    const { userId } = req.query;
    const { success } = transactionSchema.safeParse(req.body);

    if (!success) {
      return res.status(411).json({
        message: "Invalid Inputs",
      });
    }

    //fetch the account within the transaction and check validity

    const fromAccount = await Account.findOne({
      userId,
    }).session(session);

    if (!fromAccount) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Invalid Account",
      });
    }

    if (fromAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficinet Balance",
      });
    }

    const toAccount = await Account.findOne({
      userId: to,
    }).session(session);

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Invalid Account",
      });
    }

    //perform the transaction
    await Account.updateOne(
      { userId: fromAccount._id }, //where to perform
      { $inc: { balance: -amount } } //what to perform
    ).session(session);

    await Account.updateOne(
      { userId: toAccount._id },
      { $inc: { balance: amount } }
    ).session(session);

    //end the session
    await session.commitTransaction();
    res.status(200).json({
      message: "Transaction Succesful!",
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Transaction was not Succesful",
      error,
    });
  }
});

module.exports = router;

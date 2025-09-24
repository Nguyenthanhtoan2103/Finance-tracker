// const Transaction = require('../models/Transaction');
// const redisClient = require('../services/redisClient'); // Redis client

// // --- Helpers ---
// const invalidateTransactionCache = async (userId) => {
//   await redisClient.del(`transactions:${userId}`);
//   await redisClient.del(`top5:${userId}`);
// };

// // --- Create transaction ---
// const createTransaction = async (req, res) => {
//   try {
//     const transaction = new Transaction({ ...req.body, user: req.user });
//     await transaction.save();

//     // Xóa cache
//     await invalidateTransactionCache(req.user);

//     // 🔔 Emit real-time
//     req.io.emit(`transaction:${req.user}`, {
//       action: "created",
//       data: transaction,
//     });

//     res.json(transaction);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- Get transactions ---
// const getTransactions = async (req, res) => {
//   const cacheKey = `transactions:${req.user}`;
//   try {
//     const cached = await redisClient.get(cacheKey);
//     if (cached) return res.json(JSON.parse(cached));

//     const transactions = await Transaction.find({ user: req.user }).sort({ date: -1 });
//     await redisClient.setEx(cacheKey, 60, JSON.stringify(transactions));
//     res.json(transactions);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- Get Top 5 transactions ---
// const getTop5Transactions = async (req, res) => {
//   const cacheKey = `top5:${req.user}`;
//   try {
//     const cached = await redisClient.get(cacheKey);
//     if (cached) return res.json(JSON.parse(cached));

//     const top5 = await Transaction.find({ user: req.user })
//       .sort({ amount: -1 })
//       .limit(5);

//     await redisClient.setEx(cacheKey, 60, JSON.stringify(top5));
//     res.json(top5);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- Update transaction ---
// const updateTransaction = async (req, res) => {
//   try {
//     const transaction = await Transaction.findById(req.params.id);
//     if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
//     if (transaction.user.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

//     Object.keys(req.body).forEach(key => {
//       transaction[key] = req.body[key];
//     });

//     await transaction.save();

//     // Xóa cache
//     await invalidateTransactionCache(req.user);

//     // 🔔 Emit real-time
//     req.io.emit(`transaction:${req.user}`, {
//       action: "updated",
//       data: transaction,
//     });

//     res.json(transaction);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- Delete transaction ---
// const deleteTransaction = async (req, res) => {
//   try {
//     const transaction = await Transaction.findById(req.params.id);
//     if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
//     if (transaction.user.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

//     await transaction.deleteOne();

//     // Xóa cache
//     await invalidateTransactionCache(req.user);

//     // 🔔 Emit real-time
//     req.io.emit(`transaction:${req.user}`, {
//       action: "deleted",
//       data: { _id: req.params.id },
//     });

//     res.json({ message: 'Transaction removed' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = { 
//   createTransaction, 
//   getTransactions, 
//   getTop5Transactions, 
//   updateTransaction, 
//   deleteTransaction 
// };
const Transaction = require('../models/Transaction');
const redisClient = require('../services/redisClient'); // Redis client

// --- Helpers ---
const invalidateTransactionCache = async (userId) => {
  await redisClient.del(`transactions:${userId}`);
  await redisClient.del(`top5:${userId}`);
};

// --- Create transaction ---
const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({ ...req.body, user: req.user });
    await transaction.save();

    // Xóa cache
    await invalidateTransactionCache(req.user);

    // 🔔 Emit real-time chỉ cho user đó
    req.io.to(req.user).emit("transaction:update", {
      action: "created",
      data: transaction,
    });

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Get transactions ---
const getTransactions = async (req, res) => {
  const cacheKey = `transactions:${req.user}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const transactions = await Transaction.find({ user: req.user }).sort({ date: -1 });
    await redisClient.setEx(cacheKey, 60, JSON.stringify(transactions));
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Get Top 5 transactions ---
const getTop5Transactions = async (req, res) => {
  const cacheKey = `top5:${req.user}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const top5 = await Transaction.find({ user: req.user })
      .sort({ amount: -1 })
      .limit(5);

    await redisClient.setEx(cacheKey, 60, JSON.stringify(top5));
    res.json(top5);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Update transaction ---
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.keys(req.body).forEach(key => {
      transaction[key] = req.body[key];
    });

    await transaction.save();

    // Xóa cache
    await invalidateTransactionCache(req.user);

    // 🔔 Emit real-time
    req.io.to(req.user).emit("transaction:update", {
      action: "updated",
      data: transaction,
    });

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Delete transaction ---
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();

    // Xóa cache
    await invalidateTransactionCache(req.user);

    // 🔔 Emit real-time
    req.io.to(req.user).emit("transaction:update", {
      action: "deleted",
      data: { _id: req.params.id },
    });

    res.json({ message: 'Transaction removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  createTransaction, 
  getTransactions, 
  getTop5Transactions, 
  updateTransaction, 
  deleteTransaction 
};

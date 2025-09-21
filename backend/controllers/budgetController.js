const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const User = require("../models/User")
const redisClient = require("../services/redisClient"); // Redis client

// --- Helpers ---
const invalidateBudgetCache = async (userId) => {
  await redisClient.del(`budgets:${userId}`);
};

// --- Set or update budget ---
const setBudget = async (req, res) => {
    try {
    const budget = new Budget({
      user: req.user, // lấy từ authMiddleware
      category: req.body.category,
      limit: req.body.limit,
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// --- Get budgets + spent + progress ---
const getBudgets = async (req, res) => {
  const userId = req.user;
  const cacheKey = `budgets:${userId}`;

  try {
    // Kiểm tra cache trước
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const budgets = await Budget.find({ user: userId });
    const transactions = await Transaction.find({ user: userId, type: "expense" });

    const spent = {};
    transactions.forEach((t) => {
      spent[t.category] = (spent[t.category] || 0) + t.amount;
    });

    const result = budgets.map((b) => ({
      category: b.category,
      limit: b.limit,
      spent: spent[b.category] || 0,
      progress: b.limit > 0 ? ((spent[b.category] || 0) / b.limit) * 100 : 0,
    }));

    // Lưu vào cache 60s
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { setBudget, getBudgets, invalidateBudgetCache };

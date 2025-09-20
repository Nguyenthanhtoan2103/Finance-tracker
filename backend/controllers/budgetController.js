const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const setBudget = async (req, res) => {
  const { category, limit } = req.body;
  const userId = req.user.id;

  let budget = await Budget.findOne({ user: userId, category });
  if (budget) {
    budget.limit = limit;
    await budget.save();
  } else {
    budget = await Budget.create({ user: userId, category, limit, user: userId });
  }
  res.json(budget);
};

// Lấy budget + chi tiêu hiện tại theo category
const getBudgets = async (req, res) => {
  const userId = req.user.id;
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
    progress: ((spent[b.category] || 0) / b.limit) * 100,
  }));

  res.json(result);
};

module.exports = { setBudget, getBudgets };

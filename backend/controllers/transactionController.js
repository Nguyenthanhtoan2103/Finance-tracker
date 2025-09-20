const Transaction = require('../models/transaction');

// Create transaction
const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({ ...req.body, user: req.user });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Cập nhật các trường từ req.body
    Object.keys(req.body).forEach(key => {
      transaction[key] = req.body[key];
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createTransaction, getTransactions, updateTransaction, deleteTransaction };

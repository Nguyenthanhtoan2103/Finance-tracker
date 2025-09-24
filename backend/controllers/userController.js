const User = require("../models/User");


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); 
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers };

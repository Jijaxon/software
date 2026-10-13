const { pool } = require("../../db");
const { toRecords } = require("../../db/records");

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    const searchResults = toRecords((await pool.query(
      `SELECT * FROM products WHERE title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1 OR brand ILIKE $1`,
      [`%${keyword.replace(/[\\%_]/g, '\\$&')}%`]
    )).rows);

    res.status(200).json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { searchProducts };
const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");

const addAddress = async (req, res) => {
  try {
    const { userId, address, city, pincode, phone, notes } = req.body;

    if (!userId || !address || !city || !pincode || !phone || !notes) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const newlyCreatedAddress = toRecord((await pool.query(
      'INSERT INTO addresses (user_id, address, city, pincode, notes, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, address, city, pincode, notes, phone]
    )).rows[0]);

    res.status(201).json({
      success: true,
      data: newlyCreatedAddress,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchAllAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required!",
      });
    }

    const addressList = toRecords((await pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC', [userId])).rows);

    res.status(200).json({
      success: true,
      data: addressList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const editAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "User and address id is required!",
      });
    }

    const fields = ['address', 'city', 'pincode', 'phone', 'notes'];
    const updates = fields.filter((field) => formData[field] !== undefined);
    const values = updates.map((field) => formData[field]);
    const setClause = updates.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const address = updates.length
      ? toRecord((await pool.query(
          `UPDATE addresses SET ${setClause}, updated_at = NOW() WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
          [...values, addressId, userId]
        )).rows[0])
      : toRecord((await pool.query('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [addressId, userId])).rows[0]);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "User and address id is required!",
      });
    }

    const address = toRecord((await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *', [addressId, userId])).rows[0]);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { addAddress, editAddress, fetchAllAddress, deleteAddress };
const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");
const {deleteFiles} = require("../../middleware/upload");

const addFeatureImage = async (req, res) => {
  try {

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/banners/${req.file.filename}`;
    }

    const featureImages = toRecord((await pool.query(
      'INSERT INTO features (image) VALUES ($1) RETURNING *', [imagePath]
    )).rows[0]);

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = toRecords((await pool.query('SELECT * FROM features ORDER BY created_at DESC')).rows);

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const {id} = req.params;

    const image = toRecord((await pool.query('SELECT * FROM features WHERE id = $1', [id])).rows[0]);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image) {
      await deleteFiles([image?.image]);
    }

    await pool.query('DELETE FROM features WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
}

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
const Feature = require("../../models/Feature");
const Product = require("../../models/Product");
const {deleteFiles} = require("../../middleware/upload");

const addFeatureImage = async (req, res) => {
  try {

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/banners/${req.file.filename}`;
    }

    const featureImages = new Feature({
      image: imagePath,
    });

    await featureImages.save();

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
    const images = await Feature.find({});

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

    const image = await Feature.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image) {
      await deleteFiles([image?.image]);
    }

    await Feature.findByIdAndDelete(id);

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
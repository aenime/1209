const SliderWithLogo = require("../model/SliderWithLogo.modal");

// Add new slider with logo data
exports.addSliderWithLogo = async (req, res) => {
  try {
    await SliderWithLogo.create(req.body);
    res.status(200).json({
      statusCode: 1,
      data: "Slider data saved successfully",
    });
  } catch (e) {
    res.status(500).json({ statusCode: 0, data: "Internal Server Error" });
  }
};

// Get slider with logo data
exports.getSliderWithLogo = async (req, res) => {
  try {
    const sliderWithLogo = await SliderWithLogo.findOne();
    
    // If no slider data exists, return empty structure
    if (!sliderWithLogo) {
      return res.status(200).json({
        statusCode: 1,
        data: {
          logo: null,
          slideImages: []
        },
      });
    }
    
    // Ensure slideImages is always an array
    const responseData = {
      ...sliderWithLogo.toObject(),
      slideImages: sliderWithLogo.slideImages || []
    };
    
    res.status(200).json({
      statusCode: 1,
      data: responseData,
    });
  } catch (e) {
    res.status(500).json({ statusCode: 0, data: "Internal Server Error" });
  }
};

// Update slider with logo data
exports.updateSliderWithLogo = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.logo) {
      fieldsToUpdate.logo = req.body.logo;
    }
    if (req.body.slideImages) {
      fieldsToUpdate.slideImages = req.body.slideImages;
    }

    await SliderWithLogo.updateOne(
      {
        _id: req.params.id,
      },
      { $set: fieldsToUpdate },
      { new: true }
    );
    res.status(200).json({ statusCode: 1, data: "Slider updated successfully" });
  } catch (e) {
    res
      .status(500)
      .json({ statusCode: 0, data: "Internal Server Error", message: e });
  }
};

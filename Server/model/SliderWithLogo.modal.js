const mongoose = require("mongoose");

const SliderWithLogo = new mongoose.Schema({
  logo: {
    type: String,
  },
  slideImages: {
    type: Array,
  },
});

module.exports = mongoose.model("SliderWithLogo", SliderWithLogo);

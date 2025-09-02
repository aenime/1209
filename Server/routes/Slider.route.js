const SliderController = require("../Controller/Slider.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.get("/api/slider/get", 
    SliderController.getSliderWithLogo);
  app.post("/api/slider/add",
    SliderController.addSliderWithLogo
  );
  app.put("/api/slider/:id",
    SliderController.updateSliderWithLogo
  );
};

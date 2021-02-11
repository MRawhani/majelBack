const express = require("express");
const auth = require("../middlewares/auth");

const CompaniesModel = require("../models/CompaniesModel");

const router = express.Router();

const upload = require("../services/image-upload");
const singleUpload = upload.single("image");
const uploadsBusinessGallery = upload.array("galleryImage", 3);
router.post("/image-upload", function (req, res, next) {
  singleUpload(req, res, next, function (err) {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "image Error!", detail: err.message }],
      });
    }
    const imageName = req.file.key;
    const imageLocation = req.file.location;
    // Save the file name into database into profile model
    res.json({
      image: imageName,
      location: imageLocation,
    });
  });
});
function uploadFunction (req, res,next)  {
  uploadsBusinessGallery(req, res,function (error) {
    console.log("files", req.files);
    if (error) {
      console.log("errors", error);
      return next({
          type: "custom",
          title: error.code,
          message: error.message,
        });
    } else {
      // If File not found
      if (req.files === undefined) {
        console.log("Error: No File Selected!");
        return next({
          type: "custom",
          title: "no files",
          message:"لايوجد ملفات",
        });
      } else {
        // If Success
        let fileArray = req.files,
          fileLocation;
        const galleryImgLocationArray = [];
        for (let i = 0; i < fileArray.length; i++) {
          fileLocation = fileArray[i].location;
          console.log("filenm", fileLocation);
          galleryImgLocationArray.push(fileLocation);
        }
        // Save the file name into database
        res.json({
          filesArray: fileArray,
          locationArray: galleryImgLocationArray,
        });
      }
    }
  });
}

router.post(
  "/images-upload",
  auth.authMiddleware(CompaniesModel),
  
 uploadFunction
);

module.exports = router;

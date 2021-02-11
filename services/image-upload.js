const aws = require("aws-sdk");
const path = require("path");
const config = require("../config");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: config.SECRET_ACCESS_KEY,
  accessKeyId: config.ACCESS_KEY_ID,
  region: "ap-south-1",
  AWS_SDK_LOAD_CONFIG:1
});
const s3 = new aws.S3();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("نوعية الملف غير مدعومة"), false);
  }
};
const upload = multer({ 
  fileFilter,
  storage: multerS3({
    s3: s3,

    acl: "public-read",
    bucket: "orboon",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
    limits:{ fileSize: 3000000 }, // In bytes: 3000000 bytes = 3 MB
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "Testing" });
    },
    // fileFilter: function( req, file, cb ){
    //   fileFilter( file, cb );
    //  }
    
  }),
});

module.exports = upload;

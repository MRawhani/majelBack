const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const AddressSchema = require("./models/AddressSchema");
const FakeDb = require("./FakeDb");
//
const Error = require("./middlewares/Error");

const config = require("./config");
//
const bookingsRoute = require("./routes/BookingsRoute");
const customersRoute = require("./routes/CustomersRoute");
const imagesupload = require("./routes/image-upload");
const productsRoute = require("./routes/ProductsRoute");
const companiesRoute = require("./routes/CompaniesRoute");
const categoriesRoute = require("./routes/CategoriesRoute");
const generalRoute = require("./routes/generalRoutes");

process.on("uncaughtException", function (ex) {
  console.log(ex);
  //these functions for handling un caought errors, in order not to hang the node
});
process.on("unhandledRejection", function (ex) {
  console.log(ex);
});
mongoose
  .connect(config.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    if (process.env.NODE_ENV !== "production") {
      AddressSchema.count().then((count) => {
        if (count === 0) {
          // load prdefined data
          // which I prepare and named according to my collection name
          const fakeDb = new FakeDb();

          fakeDb.pushDataToDb();
          console.log("addreses added");
        }
      });
      console.log("sucsess");
    }
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1/general", generalRoute);
app.use("/api/v1/companies", companiesRoute);
app.use("/api/v1/categories", categoriesRoute);
app.use("/api/v1/products", productsRoute);
app.use("/api/v1/customers", customersRoute);
app.use("/api/v1/bookings", bookingsRoute);
app.use("/api/v1", imagesupload);

app.use(Error);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("Running");
});

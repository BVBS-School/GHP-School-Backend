const dotenv = require("dotenv");
require("./mongoconfig");
dotenv.config();

const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const path = require("path");
const { principalAdd, principalEdit } = require("./controller/PrincipalController");
let upload = require("./utils/uploadConfig");
const { directorAdd, directorEdit } = require("./controller/DirectorController");
const { bannerAdd } = require("./controller/BannerController");
const { resultAdd, ResultEdit } = require("./controller/ResultController");
const { galleryAdd } = require("./controller/GalleryController");
const uploadgallery = require("./utils/uploadGallery");
const uploadToCloudinary = require("./utils/uploadCloudinary");
const { verifyToken } = require("./controller/AuthController");

// const corsOptions = {
//   origin: ['https://ghp-school.vercel.app', 'http://localhost:3000', 'https://bvbs.vercel.app/', 'https://balvishwabharti.com/'], // Allowed origins
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: '*', // Allow all headers
//   credentials: true,
//   optionsSuccessStatus: 200, // for legacy browsers
// }
const corsOptions = {
  origin: "*", // Allowed origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: '*', // Allow all headers
  credentials: true,
  optionsSuccessStatus: 200, // for legacy browsers
}

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests for POST routes
app.options("*", cors(corsOptions));

// Parsing middlewares
app.use(express.json({ limit: '2000mb' }));
app.use(express.urlencoded({ extended: true }));

app.post("/home/banner/upload", uploadToCloudinary.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }
    // Cloudinary returns the URL in req.file.path
    const url = req.file.path;

    res.status(200).json({
      status: true,
      message: "Image uploaded successfully",
      url: url
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

upload = multer();
app.use(upload.none());

app.use("/user", require("./routes/userRoutes"));
app.use("/about", require("./routes/aboutRoutes"));
app.use("/career", require("./routes/careerRoutes"));
app.use("/home", require("./routes/homeRoutes"));
app.post("/home/banner/add", verifyToken, bannerAdd);

app.post("/result/add", verifyToken, resultAdd);
app.post("/result/Edit", verifyToken, ResultEdit);

app.post("/about/principal/add", verifyToken, principalAdd);
app.post("/about/principal/edit", verifyToken, principalEdit);
app.post("/about/director/add", verifyToken, directorAdd);
app.post("/about/director/edit", verifyToken, directorEdit);
app.use("/result", require("./routes/resultRoutes"));
app.use("/fees", require("./routes/feesRoutes"));
app.use("/facilities", require("./routes/facilitiesRoutes"));
app.use("/donation", require("./routes/donationRoutes"));
app.use("/inquiry", require("./routes/InquiryRoutes"));
app.use("/academics", require("./routes/academicsRoutes"));
app.use("/admissionform", require("./routes/admissionFormRoutes"));
app.use("/payment", require("./routes/Paymentroute"));
// Gallery Upload route
app.post("/facilities/gallery/add", galleryAdd);

app.use('/images', express.static(path.join(__dirname, 'images')));

const PORT = process.env.REACT_APP_SERVER_DOMIN || 3001; // Add default port

app.get("/", (req, res) => {
  res.json({
    msg: 'Hello World',
    status: 200,
  });
});

const server = app.listen(PORT, () => console.log("Server is running at port : " + PORT));
server.timeout = 360000; // 6 minutes

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Banner = require("../db/Banner");
const fs = require("fs");
const path = require("path"); // Make sure to import the path module
const { default: axios } = require("axios");
const logger = require("../utils/Logger");
exports.bannerAdd = catchAsync(async (req, res, next) => {
  try {
    console.log("req.body",req.body);
    const { photo, hash } = req.body;
    // const photo = req.file.filename;
    if (!photo) {
      return res.status(400).json({
        status: false,
        message: "All fields are required!",
      });
    }
    const lastBanner = await Banner.findOne().sort({ srNo: -1 });
    const srNo = lastBanner ? lastBanner.srNo + 1 : 1;
    const newBanner = new Banner({
      srNo,
      photo,
      imagehash:hash,
    });
    await newBanner.save();
    res.status(201).json({
      status: "success",
      message: "Banner Added Successfully!",
      data: {
        Banner: newBanner,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    });
  }
});

exports.bannerGet = catchAsync(async (req, res, next) => {
  try {
    const data = await Banner.find().sort({ srNo: 1 });
    res.status(200).json({
      status: true,
      message: "Data retrieved successfully!",
      banners: data,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    });
  }
});

exports.bannerDelete = catchAsync(async (req, res, next) => {
  try {
    const { srNo } = req.body;
    // Validate the input
    if (!srNo) {
      return res.status(400).json({
        status: false,
        message: "Banner number (srNo) is required",
      });
    }
    
    // Find and delete the banner
    const deletedBanner = await Banner.findOneAndDelete({ srNo });
    if (!deletedBanner) {
      return res.status(404).json({
        status: false,
        message: `No banner found with srNo: ${srNo}`,
      });
    }

    // // Extract the imagehash and send delete request to Imgur
    // const imagehash = deletedBanner.imagehash;
    // const imgurDeleteUrl = `https://api.imgur.com/3/image/${imagehash}`;

    // try {
    //   await axios.delete(imgurDeleteUrl, {
    //     headers: {
    //       Authorization: `Client-ID fa9cff918a9554a`, 
    //     }
    //   });
    // } catch (imgurError) {
    //   console.error("Error deleting image from Imgur:", imgurError.response?.data || imgurError.message);
    //   return res.status(500).json({
    //     status: false,
    //     message: "Banner deleted but failed to delete image from Imgur",
    //     error: imgurError.response?.data || imgurError.message,
    //   });
    // }

    // Adjust the `srNo` for the other banners
    const BannersToUpdate = await Banner.find({ srNo: { $gt: srNo } });
    if (BannersToUpdate.length > 0) {
      await Banner.updateMany({ srNo: { $gt: srNo } }, { $inc: { srNo: -1 } });
    }

    // Respond with success
    return res.status(200).json({
      status: true,
      message: `Banner and image deleted successfully`,
      deletedBanner: deletedBanner,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error to see details
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    });
  }
});

exports.bannerMove = catchAsync(async (req, res, next) => {
  try {
    const {id, oldPosition, newPosition } = req.body;
    if (!oldPosition || !newPosition) {
      return res.status(400).json({
        status: false,
        message: "Both fields are required",
      });
    }

    if (newPosition > oldPosition) { // Moved downwards
      // Decrement srNo of all items between oldPosition+1 and newPosition
      await Banner.updateMany(
        { srNo: { $gt: oldPosition, $lte: newPosition } },
        { $inc: { srNo: -1 } }
      );
      // Update the faculty member being moved to the new position
      await Banner.updateOne(
        { _id: id },
        { $set: { srNo: newPosition } }
      );
    }
    else if(newPosition < oldPosition){ // Moved upwards
      // Increment srNo of all items between oldPosition-1 and newPosition
      await Banner.updateMany(
        { srNo: { $gte: newPosition, $lt: oldPosition } },
        { $inc: { srNo: +1 } }
      );
       // Update the faculty member being moved to the new position
       await Banner.updateOne(
        { _id: id },
        { $set: { srNo: newPosition } }
      );
    }

    return res.status(200).json({
      status: true,
      message: "Faculty position updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    });
  }
});

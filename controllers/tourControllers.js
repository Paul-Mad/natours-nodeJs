const { query } = require('express');
const { isValidObjectId } = require('mongoose');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// ROUTE HANDLERS
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

//Catch function

//---------------TOURS--------------------------
exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query) // (query, query string)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //get the query response from the DB
  const tours = await features.query;
  //send the response with a json using JSend format
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // // find the tour by the id sent in the parameter
  const tour = await Tour.findById(req.params.id);

  //if the tour was not found return the error
  if (!tour) {
    return next(new AppError('No tour found with the given ID', 404));
  }
  //send the response with a json using JSend format
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  //if the tour was not found return the error
  if (!newTour) {
    return next(new AppError('No tour found with the given ID', 404));
  }
  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  //if the tour was not found return the error
  if (!tour) {
    return next(new AppError('No tour found with the given ID', 404));
  }
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  //if the tour was not found return the error
  if (!tour) {
    return next(new AppError('No Tours Found With Provided ID', 404));
  }
  //status 204 = 'no content'
  res.status(204).json({
    status: 'success',
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { stats: stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: plan,
  });
});

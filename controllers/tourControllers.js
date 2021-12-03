const { query } = require('express');
const { isValidObjectId } = require('mongoose');
const Tour = require('../models/tourModel');

// ROUTE HANDLERS
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //copy the query obj
    const queryObj = { ...this.queryString };
    //set witch fields to be excluded
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //exclude fields from the query
    excludedFields.forEach((item) => delete queryObj[item]);

    //1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); //'name duration price'
    } else {
      this.query = this.query.select('-__v'); // exclude only this field "__v"
    }

    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1; // default 1
    const limit = +this.queryString.limit || 100; // default 100;
    const skip = (page - 1) * limit;
    //page=2&limit=10, 1-10->page 1, 11-20->page 2, 21-20->page 3
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

//---------------TOURS--------------------------
exports.getAllTours = async (req, res) => {
  try {
    //BUILD THE QUERY ------------

    //EXECUTE THE QUERY ----------

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
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // // find the tour by the id sent in the parameter
    const tour = await Tour.findById(req.params.id);

    //send the response with a json using JSend format
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour: newTour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    //status 204 = 'no content'
    res.status(204).json({
      status: 'success',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = Tour.aggregate([]);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getAllTours,
  getTourStats,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getMonthlyPlan,
} = require('../controllers/tourControllers');
const router = express.Router();

//  ROUTES
//chaining requests on routes
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;

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

module.exports = APIFeatures;

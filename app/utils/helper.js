// helper.js
'use strict';

/**
 * Paginates results based on the provided model, query, page, and limit.
 * @param {Model} model - The Mongoose model to paginate.
 * @param {Object} query - The query object.
 * @param {Number} page - The page number.
 * @param {Number} limit - The number of items per page.
 * @param {Object} populate - Optional populate object for Mongoose.
 * @returns {Object} The paginated results.
 */
const paginate = async (model, query, page, limit, populate = null) => {
  const totalItems = await model.countDocuments(query);
  let currentPage = 1;
  let totalPages = 1;
  let skip = 0;

  if (page && limit) {
    currentPage = parseInt(page);
    totalPages = Math.ceil(totalItems / limit);
    if (currentPage > totalPages && totalPages !== 0) {
      throw new Error('Page number is out of bounds.');
    }
    skip = (currentPage - 1) * limit;
  }

  let queryBuilder = model.find(query);
  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }
  queryBuilder = queryBuilder.skip(skip).limit(parseInt(limit));

  const items = await queryBuilder.exec();

  return { items, totalItems, currentPage, totalPages };
};

module.exports = { paginate };

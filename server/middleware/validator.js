/**
 * Product payload validation middleware
 */
function validateProduct(req, res, next) {
  const { name, price, quantity } = req.body;
  const errors = [];

  // Validate Name
  if (name === undefined || name === null || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Product name is required.' });
  } else if (name.trim().length > 150) {
    errors.push({ field: 'name', message: 'Product name cannot exceed 150 characters.' });
  }

  // Validate Price
  if (price === undefined || price === null || price === '') {
    errors.push({ field: 'price', message: 'Price is required.' });
  } else {
    const numPrice = Number(price);
    if (isNaN(numPrice) || !isFinite(numPrice)) {
      errors.push({ field: 'price', message: 'Price must be a valid number.' });
    } else if (numPrice < 0) {
      errors.push({ field: 'price', message: 'Price cannot be negative.' });
    } else if (numPrice > 1000000000) {
      errors.push({ field: 'price', message: 'Price is unreasonably large.' });
    }
  }

  // Validate Quantity
  if (quantity === undefined || quantity === null || quantity === '') {
    errors.push({ field: 'quantity', message: 'Quantity is required.' });
  } else {
    const numQty = Number(quantity);
    if (!Number.isInteger(numQty)) {
      errors.push({ field: 'quantity', message: 'Quantity must be a whole integer.' });
    } else if (numQty < 0) {
      errors.push({ field: 'quantity', message: 'Quantity cannot be negative.' });
    } else if (numQty > 1000000000) {
      errors.push({ field: 'quantity', message: 'Quantity is unreasonably large.' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  // Clean data
  req.body.name = name.trim();
  req.body.price = parseFloat(Number(price).toFixed(2));
  req.body.quantity = parseInt(quantity, 10);

  next();
}

/**
 * ID parameter validation middleware
 */
function validateId(req, res, next) {
  const { id } = req.params;
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID. Must be a positive integer.'
    });
  }

  req.params.id = numId;
  next();
}

module.exports = {
  validateProduct,
  validateId
};

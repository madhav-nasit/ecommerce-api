'use strict';

// Importing required modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
});

// Method to format products data and calculate total amount, discount, and final amount
CartSchema.methods.formatCart = function () {
  let totalAmount = 0;
  let totalDiscount = 0;

  const formattedProducts = this.toJSON().products.map((item) => {
    const product = item.product;
    const subtotal = product.price * item.quantity;
    const discount = (subtotal * (product.discountPercentage / 100)).toFixed(2);

    totalAmount += subtotal;
    totalDiscount += parseFloat(discount);

    return {
      ...item,
      product: {
        ...product,
        category: product.category.name,
      },
    };
  });

  const finalAmount = (totalAmount - totalDiscount).toFixed(2);

  return {
    ...this.toJSON(),
    products: formattedProducts,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    finalAmount: parseFloat(finalAmount),
  };
};

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;

'use strict';

// Importing required modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Enum defining different order statuses
const OrderStatusEnum = Object.freeze({
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_PROCESSING: 'ORDER_PROCESSING',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  CANCELLED: 'CANCELLED',
});

// Schema for Order model
const OrderSchema = Schema({
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
  status: {
    type: String,
    enum: {
      values: Object.values(OrderStatusEnum),
      message: '{VALUE} is not a valid status enum.',
    },
    default: OrderStatusEnum.ORDER_PLACED,
  },
  totalAmount: Number,
  totalDiscount: Number,
  finalAmount: Number,
});

// Method to calculate total amount, total discount, and final amount of the order
OrderSchema.methods.calculateAmount = function () {
  let totalAmount = 0;
  let totalDiscount = 0;

  this.toJSON().products.forEach((item) => {
    const product = item.product;
    const subtotal = product.price * item.quantity;
    const discount = (subtotal * (product.discountPercentage / 100)).toFixed(2);

    totalAmount += subtotal;
    totalDiscount += parseFloat(discount);
  });

  const finalAmount = (totalAmount - totalDiscount).toFixed(2);

  this.totalAmount = parseFloat(totalAmount.toFixed(2));
  this.totalDiscount = parseFloat(totalDiscount.toFixed(2));
  this.finalAmount = parseFloat(finalAmount);
};

// Method to format products data and calculate total amount, discount, and final amount
OrderSchema.methods.formatOrder = function () {
  const formattedProducts = this.toJSON().products.map((item) => {
    const product = item.product;
    return {
      ...item,
      product: {
        ...product,
        category: product.category.name,
      },
    };
  });

  return {
    ...this.toJSON(),
    products: formattedProducts,
  };
};

// Create the Order model
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;

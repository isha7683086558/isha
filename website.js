const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection (e.g. MongoDB)
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Product model
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String
});

const Product = mongoose.model('Product', productSchema);

// Shopping cart model
const cartSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  subtotal: Number
});

const Cart = mongoose.model('Cart', cartSchema);

// Routes
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/add-to-cart', async (req, res) => {
  const productId = req.body.productId;
  const cart = await Cart.findOne({ _id: req.session.cartId });
  if (!cart) {
    cart = new Cart();
  }
  const product = await Product.findById(productId);
  cart.products.push(product);
  cart.subtotal += product.price;
  await cart.save();
  res.json({ message: 'Product added to cart' });
});

app.get('/cart', async (req, res) => {
  const cart = await Cart.findOne({ _id: req.session.cartId });
  if (!cart) {
    cart = new Cart();
  }
  res.json(cart);
});

app.post('/remove-from-cart', async (req, res) => {
  const productId = req.body.productId;
  const cart = await Cart.findOne({ _id: req.session.cartId });
  const productIndex = cart.products.findIndex(product => product._id === productId);
  if (productIndex !== -1) {
    cart.products.splice(productIndex, 1);
    cart.subtotal -= cart.products[productIndex].price;
    await cart.save();
  }
  res.json({ message: 'Product removed from cart' });
});

app.post('/checkout', async (req, res) => {
  const cart = await Cart.findOne({ _id: req.session.cartId });
  // Process payment and update order status
  res.json({ message: 'Checkout successful' });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

app.post('/add-review', async (req, res) => {
    const productId = req.body.productId;
    const review = {
      name: req.body.name,
      rating: req.body.rating,
      review: req.body.review
    };
    const product = await Product.findById(productId);
    product.reviews.push(review);
    await product.save();
    res.json({ message: 'Review added successfully' });
  });
  
  app.get('/product/:id/reviews', async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.json(product.reviews);
  });

  const apiUrl = 'http://localhost:3000/api';

// Get products
fetch(`${apiUrl}/products`)
  .then(response => response.json())
  .then(products => {
    const productsList = document.getElementById('products-list');
    products.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product._id}</td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>${product.price}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      productsList.appendChild(row);
    });
  });

// Get orders
fetch(`${apiUrl}/orders`)
  .then(response => response.json())
  .then(orders => {
    const ordersList = document.getElementById('orders-list');
    orders.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${order._id}</td>
        <td>${order.customer}</td>
        <td>${order.orderDate}</td>
        <td>${order.total}</td>
        <td>${order.status}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      ordersList.appendChild(row);
    });
  });

// Get reviews
fetch(`${apiUrl}/reviews`)
  .then(response => response.json())
  .then(reviews => {
    const reviewsList = document.getElementById('reviews-list');
    reviews.forEach(review => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${review._id}</td>
        <td>${review.product}</td>
        <td>${review.rating}</td>
        <td>${review.review}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      reviewsList.appendChild(row);
    });
  });

// Add product
document.getElementById('add-product-btn').addEventListener('click', () => {
  const productName = prompt('Enter product name');
  const productDescription = prompt('Enter product description');
  const productPrice = prompt('Enter product price');
  fetch(`${apiUrl}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: productName, description: productDescription, price: productPrice })
  })
    .then(response => response.json())
    .then(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product._id}</td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>${product.price}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      document.getElementById('products-list').appendChild(row);
    });
});
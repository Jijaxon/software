require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRouter = require('./routes/auth/auth-routs');
const adminProductsRouter = require('./routes/admin/product-routes')

const adminOrderRouter = require('./routes/admin/order-routes')
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");

const shopReviewRouter = require("./routes/shop/review-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");

const dashboardRouter = require("./routes/dashboard/dashboard-routes")

// database connection
mongoose
	.connect(
    'mongodb+srv://azizasalimova098_db_user:Az!zaxon1949@cluster0.xmnc5y8.mongodb.net/ecommerce?retryWrites=true&w=majority'
    // 'mongodb+srv://azizasalimova098_db_user:azizasalimova098_db_user@cluster0.xmnc5y8.mongodb.net/'
	)
	.then(() => console.log('MongoDB connected'))
	.catch(error => console.log(error))

const app = express()
const PORT = process.env.PORT || 5000

app.use(
	cors(
    {
		origin: 'http://localhost:5173',
		// origin: '*',
		methods: ['GET', 'POST', 'DELETE', 'PUT'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'Cache-Control',
			'Expires',
			'Pragma',
		],
		credentials: true,
	})
);

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.use("/api/dashboard", dashboardRouter);

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get('/', (req,res) => res.status(200).json({ ok: true }))
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

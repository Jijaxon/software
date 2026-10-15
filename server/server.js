require('dotenv').config();
const express = require('express')
const path = require('path')
const { pool, initializeDatabase } = require('./db')
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

const wishlistRouter = require("./routes/shop/wishlist-routes")

const { startTelegramBot } = require('./telegram/bot')

const app = express()
const PORT = process.env.PORT || 5000

app.use(
	cors(
    {
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

app.use("/api/shop/wishlist", wishlistRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.use("/api/dashboard", dashboardRouter);

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get('/', (req,res) => res.status(200).json({ ok: true }))

initializeDatabase()
	.then(() => {
		console.log('PostgreSQL connected and tables are ready')
		app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
		startTelegramBot()
	})
	.catch(async (error) => {
		console.error('PostgreSQL startup failed:', error.message)
		await pool.end()
		process.exit(1)
	})
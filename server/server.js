const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRouter = require('./routes/auth/auth-routs');
const adminProductsRouter = require('./routes/admin/product-routes')
const adminOrderRouter = require('./routes/admin/order-routes')
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

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get('/', (req,res) => res.status(200).json({ ok: true }))
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

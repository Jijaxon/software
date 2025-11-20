// const paypal = require("../../helpers/paypal");
// const Order = require("../../models/Order");
// const Cart = require("../../models/Cart");
// const Product = require("../../models/Product");
//
// const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       cartItems,
//       addressInfo,
//       orderStatus,
//       paymentMethod,
//       paymentStatus,
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       paymentId,
//       payerId,
//       cartId,
//     } = req.body;
//
//     const create_payment_json = {
//       intent: "sale",
//       payer: {
//         payment_method: "paypal",
//       },
//       redirect_urls: {
//         return_url: "http://localhost:5173/shop/paypal-return",
//         cancel_url: "http://localhost:5173/shop/paypal-cancel",
//       },
//       transactions: [
//         {
//           item_list: {
//             items: cartItems.map((item) => ({
//               name: item.title,
//               sku: item.productId,
//               price: item.price.toFixed(2),
//               currency: "USD",
//               quantity: item.quantity,
//             })),
//           },
//           amount: {
//             currency: "USD",
//             total: totalAmount.toFixed(2),
//           },
//           description: "description",
//         },
//       ],
//     };
//
//     paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
//       if (error) {
//         console.log(error);
//
//         return res.status(500).json({
//           success: false,
//           message: "Error while creating paypal payment",
//         });
//       } else {
//         const newlyCreatedOrder = new Order({
//           userId,
//           cartId,
//           cartItems,
//           addressInfo,
//           orderStatus,
//           paymentMethod,
//           paymentStatus,
//           totalAmount,
//           orderDate,
//           orderUpdateDate,
//           paymentId,
//           payerId,
//         });
//
//         await newlyCreatedOrder.save();
//
//         const approvalURL = paymentInfo.links.find(
//           (link) => link.rel === "approval_url"
//         ).href;
//
//         res.status(201).json({
//           success: true,
//           approvalURL,
//           orderId: newlyCreatedOrder._id,
//         });
//       }
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };
//
// const capturePayment = async (req, res) => {
//   try {
//     const { paymentId, payerId, orderId } = req.body;
//
//     let order = await Order.findById(orderId);
//
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order can not be found",
//       });
//     }
//
//     order.paymentStatus = "paid";
//     order.orderStatus = "confirmed";
//     order.paymentId = paymentId;
//     order.payerId = payerId;
//
//     for (let item of order.cartItems) {
//       let product = await Product.findById(item.productId);
//
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Not enough stock for this product ${product.title}`,
//         });
//       }
//
//       product.totalStock -= item.quantity;
//
//       await product.save();
//     }
//
//     const getCartId = order.cartId;
//     await Cart.findByIdAndDelete(getCartId);
//
//     await order.save();
//
//     res.status(200).json({
//       success: true,
//       message: "Order confirmed",
//       data: order,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };
//
// const getAllOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//
//     const orders = await Order.find({ userId });
//
//     if (!orders.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No orders found!",
//       });
//     }
//
//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };
//
// const getOrderDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//
//     const order = await Order.findById(id);
//
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found!",
//       });
//     }
//
//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };
//
// module.exports = {
//   createOrder,
//   capturePayment,
//   getAllOrdersByUser,
//   getOrderDetails,
// };

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// ✅ 1. Stripe orqali Checkout Session yaratish
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      cartId,
    } = req.body;

    // Stripe Checkout Session yaratamiz
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: item?.price,
        },
        quantity: item.quantity,
      })),
      success_url: "http://localhost:5173/shop/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/shop/cancel",
      customer_email: addressInfo?.email || "guest@example.com",
    });

    // Buyurtmani bazaga vaqtinchalik saqlaymiz
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: session.id,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      url: session.url, // Stripe checkout sahifasiga yo‘naltiruvchi link
      orderId: newOrder._id,
    });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    res.status(500).json({
      success: false,
      message: "Error while creating Stripe checkout session",
    });
  }
};

// ✅ 2. To‘lovni tasdiqlash (Stripe webhook yoki frontend orqali)
const confirmPayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.paymentId = session.payment_intent;
      order.orderUpdateDate = new Date();

      await order.save();

      // Ombordagi mahsulotlarni kamaytiramiz
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);
        if (product) {
          product.totalStock -= item.quantity;
          await product.save();
        }
      }

      // Savatchani o‘chiramiz
      await Cart.findByIdAndDelete(order.cartId);

      console.log("order", order)
      res.status(200).json({ success: true, message: "Order confirmed", data: order });
    } else {
      console.log("not completed")
      res.status(400).json({ success: false, message: "Payment not completed" });
    }
  } catch (e) {
    console.error("Confirm payment error:", e);
    res.status(500).json({ success: false, message: "Error confirming payment" });
  }
};

// ✅ 3. Foydalanuvchi buyurtmalari
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

// ✅ 4. Buyurtma tafsilotlari
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

module.exports = {
  createOrder,
  confirmPayment,
  getAllOrdersByUser,
  getOrderDetails,
};

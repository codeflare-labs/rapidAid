const express = require("express");
const { route } = require("./auth");
const auth = require("../middlewares/auth");
const { isManager } = require("../middlewares/role");
const { getBookings, updateBookingByAdmin } = require("../controllers/bookingController");

const router = express.Router();



router.use(auth);
router.get("/booking" , isManager , getBookings);
router.patch("/updatebooking/:id" , isManager , updateBookingByAdmin);

module.exports  = route ;






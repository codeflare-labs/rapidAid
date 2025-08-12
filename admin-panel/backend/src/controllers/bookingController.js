const Booking = require('../models/Booking');
const Ambulance = require('../models/Ambulance');

const getBookings = async (req, res) => {
  try {
    let { page = 1, limit = 20, status, search, fromDate, toDate, plateNumber } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    
    if (status) {
      query.status = status;
    }


    if (search) {
      query.$or = [
        { _id: search },
        { otp: { $regex: search, $options: 'i' } },
      ];
    }

 
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

   
    if (plateNumber) {
      const ambulance = await Ambulance.findOne({ plateNumber: { $regex: plateNumber, $options: 'i' } });
      if (ambulance) {
        query.ambulanceId = ambulance._id;
      } else {
    
        return res.json({ bookings: [], total: 0, currentPage: page, totalPages: 0 });
      }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name email')
        .populate('driverId', 'name email')
        .populate('ambulanceId', 'plateNumber status')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    res.json({
      bookings,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBookingByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, status, driverId, ambulanceId, regenerateOtp } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

 
    if (regenerateOtp) {
      booking.otp = Math.floor(1000 + Math.random() * 9000).toString();
    }


    if (otp) {
      booking.otp = otp;
    }

   
    if (status) {
      booking.status = status;
    }

 
    if (driverId) {
      booking.driverId = driverId;
    }

    
    if (ambulanceId) {
      booking.ambulanceId = ambulanceId;
    }

    await booking.save();

    res.json({ message: 'Booking updated successfully', booking });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getBookings ,  updateBookingByAdmin};



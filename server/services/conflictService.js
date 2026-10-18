const Booking = require('../models/Booking');
const Resource = require('../models/Resource');

/**
 * Checks if a requested booking time conflicts with any active (Approved or Pending) booking for the resource.
 * Conflict Rule: existing.startTime < requested.endTime && existing.endTime > requested.startTime
 */
const checkBookingConflict = async ({ resourceId, startTime, endTime, excludeBookingId = null }) => {
  const reqStart = new Date(startTime);
  const reqEnd = new Date(endTime);

  const query = {
    resourceId,
    status: { $in: ['Approved', 'Pending'] },
    startTime: { $lt: reqEnd },
    endTime: { $gt: reqStart },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await Booking.find(query)
    .populate('userId', 'name email department')
    .sort({ startTime: 1 });

  return {
    hasConflict: conflictingBookings.length > 0,
    conflicts: conflictingBookings,
  };
};

/**
 * Finds alternative available time slots for the SAME resource on the requested day.
 */
const findAlternativeSlots = async ({ resourceId, requestedDate, durationMinutes = 120 }) => {
  const dayStart = new Date(requestedDate);
  dayStart.setHours(8, 0, 0, 0); // Campus opens 8:00 AM

  const dayEnd = new Date(requestedDate);
  dayEnd.setHours(19, 0, 0, 0); // Campus closes 7:00 PM

  // Get all bookings on this day for this resource
  const dayBookings = await Booking.find({
    resourceId,
    status: { $in: ['Approved', 'Pending'] },
    startTime: { $lt: dayEnd },
    endTime: { $gt: dayStart },
  }).sort({ startTime: 1 });

  const slotSuggestions = [];
  const candidateStarts = [
    { h: 8, m: 0 },
    { h: 9, m: 30 },
    { h: 11, m: 0 },
    { h: 13, m: 0 },
    { h: 14, m: 30 },
    { h: 16, m: 0 },
    { h: 17, m: 30 },
  ];

  for (const cand of candidateStarts) {
    const slotStart = new Date(requestedDate);
    slotStart.setHours(cand.h, cand.m, 0, 0);

    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
    if (slotEnd > dayEnd) continue;

    // Check if slot overlaps with any booking
    const overlaps = dayBookings.some(
      (b) => b.startTime < slotEnd && b.endTime > slotStart
    );

    if (!overlaps && slotStart > new Date()) {
      slotSuggestions.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        formatted: `${slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
      if (slotSuggestions.length >= 3) break;
    }
  }

  return slotSuggestions;
};

/**
 * Finds alternative available rooms matching capacity & type for the same requested time slot.
 */
const findAlternativeRooms = async ({ resourceType, minCapacity, startTime, endTime, excludeResourceId }) => {
  const reqStart = new Date(startTime);
  const reqEnd = new Date(endTime);

  // Find candidate resources of same or similar type with sufficient capacity
  const candidates = await Resource.find({
    _id: { $ne: excludeResourceId },
    type: resourceType,
    capacity: { $gte: minCapacity || 1 },
    status: 'Available',
  }).limit(5);

  const availableAlternatives = [];

  for (const candidate of candidates) {
    const conflict = await Booking.findOne({
      resourceId: candidate._id,
      status: { $in: ['Approved', 'Pending'] },
      startTime: { $lt: reqEnd },
      endTime: { $gt: reqStart },
    });

    if (!conflict) {
      availableAlternatives.push(candidate);
    }
  }

  return availableAlternatives;
};

module.exports = {
  checkBookingConflict,
  findAlternativeSlots,
  findAlternativeRooms,
};

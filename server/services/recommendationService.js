const Resource = require('../models/Resource');
const Booking = require('../models/Booking');

/**
 * Intelligent Rule-Based Room Recommendation Engine
 * Evaluates candidate campus resources based on capacity fit, equipment match,
 * location proximity, and real-time conflict-free availability.
 */
const getRecommendedRooms = async ({
  type,
  capacity = 1,
  equipment = [],
  building,
  startTime,
  endTime,
}) => {
  const reqStart = startTime ? new Date(startTime) : null;
  const reqEnd = endTime ? new Date(endTime) : null;
  const reqCapacity = parseInt(capacity, 10) || 1;
  const requestedEquipment = Array.isArray(equipment)
    ? equipment
    : equipment
    ? equipment.split(',').map((e) => e.trim().toLowerCase())
    : [];

  // Query only operational resources
  const query = { status: 'Available' };
  if (type) {
    query.type = type;
  }
  // Candidate must at least satisfy minimum capacity
  query.capacity = { $gte: reqCapacity };

  const candidates = await Resource.find(query);
  const scoredRooms = [];

  for (const room of candidates) {
    let isConflictFree = true;

    // Check availability if time slot is provided
    if (reqStart && reqEnd) {
      const conflict = await Booking.findOne({
        resourceId: room._id,
        status: { $in: ['Approved', 'Pending'] },
        startTime: { $lt: reqEnd },
        endTime: { $gt: reqStart },
      });
      if (conflict) {
        isConflictFree = false;
      }
    }

    // Only recommend if available during the time window
    if (!isConflictFree) continue;

    let score = 0;
    const reasons = [];

    // 1. Capacity Fit Scoring (Max 40 pts)
    const ratio = room.capacity / reqCapacity;
    if (ratio >= 1.0 && ratio <= 1.25) {
      score += 40;
      reasons.push(`Ideal capacity utilization (${room.capacity} seats for ${reqCapacity} attendees)`);
    } else if (ratio > 1.25 && ratio <= 1.75) {
      score += 30;
      reasons.push(`Comfortable room size (${room.capacity} seats)`);
    } else if (ratio > 1.75 && ratio <= 3.0) {
      score += 20;
      reasons.push(`Sufficient capacity (${room.capacity} seats)`);
    } else {
      score += 10;
      reasons.push(`Large venue with excess capacity`);
    }

    // 2. Equipment Match Scoring (Max 35 pts)
    const roomEqLower = room.equipment.map((e) => e.toLowerCase());
    if (requestedEquipment.length > 0) {
      let matchedCount = 0;
      for (const reqEq of requestedEquipment) {
        if (roomEqLower.some((e) => e.includes(reqEq.toLowerCase()))) {
          matchedCount++;
        }
      }
      const matchFraction = matchedCount / requestedEquipment.length;
      const eqPoints = Math.round(matchFraction * 35);
      score += eqPoints;
      if (matchFraction === 1) {
        reasons.push(`Matches all required equipment (${matchedCount}/${requestedEquipment.length})`);
      } else if (matchedCount > 0) {
        reasons.push(`Matches ${matchedCount} of ${requestedEquipment.length} required equipment`);
      }
    } else {
      // Bonus if well-equipped
      const eqBonus = Math.min(room.equipment.length * 7, 35);
      score += eqBonus;
      if (room.equipment.length > 0) {
        reasons.push(`Equipped with ${room.equipment.slice(0, 3).join(', ')}`);
      }
    }

    // 3. Building / Location match (Max 15 pts)
    if (building && room.location.building.toLowerCase().includes(building.toLowerCase())) {
      score += 15;
      reasons.push(`Located in preferred building (${room.location.building})`);
    } else {
      score += 8;
    }

    // 4. Approval Policy Convenience (Max 10 pts)
    if (!room.approvalRequired) {
      score += 10;
      reasons.push(`Instant booking (no approval needed)`);
    } else {
      score += 6;
    }

    const matchPercentage = Math.min(Math.round(score), 100);

    scoredRooms.push({
      resource: room,
      matchScore: matchPercentage,
      reasons,
    });
  }

  // Sort descending by matchScore
  scoredRooms.sort((a, b) => b.matchScore - a.matchScore);
  return scoredRooms;
};

module.exports = { getRecommendedRooms };

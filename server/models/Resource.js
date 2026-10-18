const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: [
        'Classroom',
        'Computer Lab',
        'Seminar Hall',
        'Projector',
        'Lab Equipment',
        'Sports Facility',
        'Auditorium',
        'Conference Room',
      ],
      default: 'Classroom',
    },
    location: {
      building: { type: String, required: true, trim: true },
      floor: { type: String, default: 'Ground Floor' },
      roomNumber: { type: String, required: true, trim: true },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    equipment: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['Available', 'Under Maintenance', 'Deactivated'],
      default: 'Available',
    },
    approvalRequired: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    maintenanceNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted location string
resourceSchema.virtual('fullLocation').get(function () {
  return `${this.location.building}, Floor ${this.location.floor}, Room ${this.location.roomNumber}`;
});

resourceSchema.set('toJSON', { virtuals: true });
resourceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Resource', resourceSchema);

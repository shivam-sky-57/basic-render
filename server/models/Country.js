const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    capital: {
      type: String,
      required: true,
      trim: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    region: {
      type: String,
      default: 'Global'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Country', countrySchema);

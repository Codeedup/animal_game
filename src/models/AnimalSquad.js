const mongoose = require('mongoose');

const AnimalSquadSchema = new mongoose.Schema({
  squad_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  pack_size: {
    type: Number,
    required: true
  },
  biome: {
    type: String,
    required: true
  },
  poster_image_url: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('AnimalSquad', AnimalSquadSchema); 
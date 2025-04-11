const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalityType: { type: String, required: true },
  scores: { type: Map, of: Number, required: true },
  description: { type: String, required: true },
  notes: { type: String, default: "" }, // ✅ Allow users to add notes about their results
  changeFromPrevious: { type: Map, of: Number, default: {} } // ✅ Track score differences from the last test
}, { timestamps: true });

module.exports = mongoose.model('TestResult', TestResultSchema);

const express = require("express");
const router = express.Router();
const TestResult = require("../models/TestResult");
const { protect } = require("../middleware/auth");

// ✅ Save a new test result
router.post("/", protect, async (req, res) => {
  try {
    const { personalityType, scores, description } = req.body;

    const testResult = await TestResult.create({
      user: req.user.id, // Save to logged-in user
      personalityType,
      scores,
      description,
    });

    res.status(201).json({ success: true, data: testResult });
  } catch (err) {
    console.error("🔥 Error saving test result:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Fetch latest and previous test results for comparison
router.get("/", protect, async (req, res) => {
  try {
    const results = await TestResult.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(2);
    
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("🔥 Error fetching test results:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

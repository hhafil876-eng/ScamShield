// Re-export index.js as server.js for backwards compatibility
module.exports = require("./index");
if (require.main === module && process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 5000;
  const server = module.exports.listen(port, "0.0.0.0", () => console.log(`ScamShield API running on port ${server.address().port}`));
}

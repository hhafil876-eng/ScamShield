// Re-export index.js as server.js for backwards compatibility
module.exports = require("./index");
if (require.main === module && process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 5000;
  module.exports.listen(port, () => console.log(`ScamShield API running on port ${port}`));
}

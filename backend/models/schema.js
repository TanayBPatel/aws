const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Using bcryptjs for compatibility

// --- User & Roles (Inheritance) ---
const userOptions = { discriminatorKey: 'role', collection: 'users' };
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, userOptions);

// Matches: public boolean login(String email, String password)
// Compare entered password with hashed password
userSchema.methods.login = async function(email, password) {
  if (this.email !== email) return false;
  try {
    return await bcrypt.compare(password, this.password);
  } catch (e) {
    return false;
  }
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(user.password, saltRounds);
    user.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);

// Investor Class
const investorSchema = new mongoose.Schema({
  tier: { type: String, default: 'basic' }, // e.g., Gold, Silver
});
// Matches: public Portfolio createPortfolio(String name)
investorSchema.methods.createPortfolio = function(name) {
  return new Portfolio({ user: this._id, name: name, balance: 1000000 }); // Default 10L balance for testing
};
const Investor = User.discriminator('investor', investorSchema);

// System Admin Class
const systemAdminSchema = new mongoose.Schema({
  adminLevel: { type: String, default: 'standard' }
});
// Matches: public void manageUsers()
systemAdminSchema.methods.manageUsers = function() {
  return User.find({});
};
// Matches: public void monitorSystem()
systemAdminSchema.methods.monitorSystem = function() {
  return { status: 'Operational', activeUsers: 1 };
};
const SystemAdmin = User.discriminator('admin', systemAdminSchema);


// --- Security & Market Data ---
const securitySchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: String,
  type: { type: String, enum: ['stock', 'crypto'] },
  currentPrice: { type: Number, default: 0 },
});
// Matches: public double getLatestPrice()
securitySchema.methods.getLatestPrice = function() {
  // In a real app, this would fetch from MarketData, using cached for now
  return this.currentPrice; 
};
const Security = mongoose.model('Security', securitySchema);

const marketDataSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Security' },
  volume: Number,
  prices: [{ timestamp: Date, price: Number }]
});
// Matches: public double fetchPrice(String symbol)
marketDataSchema.statics.fetchPrice = async function(symbol) {
  const security = await Security.findOne({ symbol });
  return security ? security.getLatestPrice() : 0;
};
const MarketData = mongoose.model('MarketData', marketDataSchema);


// --- Position ---
const positionSchema = new mongoose.Schema({
  security: { type: mongoose.Schema.Types.ObjectId, ref: 'Security' },
  quantity: { type: Number, default: 0 },
  purchasePrice: { type: Number, required: true }
});
// Matches: public double marketValue()
positionSchema.methods.marketValue = async function() {
  const sec = await Security.findById(this.security);
  return (sec ? sec.getLatestPrice() : this.purchasePrice) * this.quantity;
};


// --- Portfolio ---
const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  balance: { type: Number, default: 0 },
  positions: [positionSchema]
});

// Matches: public void addPosition(Position p)
portfolioSchema.methods.addPosition = function(positionData) {
  this.positions.push(positionData);
  return this.save();
};

// Matches: public void removePosition(Position p)
portfolioSchema.methods.removePosition = function(positionId) {
  this.positions = this.positions.filter(p => p._id.toString() !== positionId);
  return this.save();
};

// Matches: public double calculateROI()
portfolioSchema.methods.calculateROI = async function() {
  let totalMarketValue = 0;
  let totalCost = 0;

  for (const pos of this.positions) {
    const sec = await Security.findById(pos.security);
    const currentPrice = sec ? sec.getLatestPrice() : pos.purchasePrice;
    totalMarketValue += currentPrice * pos.quantity;
    totalCost += pos.purchasePrice * pos.quantity;
  }

  if (totalCost === 0) return 0;
  return ((totalMarketValue - totalCost) / totalCost) * 100;
};
const Portfolio = mongoose.model('Portfolio', portfolioSchema);


// --- Alerts ---
const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symbol: String,
  threshold: Number,
  type: { type: String, enum: ['above', 'below'] }
});
// Matches: public void notifyUser()
alertSchema.methods.notifyUser = function() {
  console.log(`ALERT: ${this.symbol} crossed threshold ${this.threshold}`);
  return { notification: `Price alert for ${this.symbol}` };
};
const Alert = mongoose.model('Alert', alertSchema);


// --- Report ---
const reportSchema = new mongoose.Schema({
  type: String, // performance, tax, etc.
  generatedAt: { type: Date, default: Date.now },
  data: Object
});
// Matches: public void generate(Portfolio p)
reportSchema.statics.generate = async function(portfolioId, type) {
  const portfolio = await Portfolio.findById(portfolioId);
  const roi = await portfolio.calculateROI();
  return new this({
    type,
    data: { portfolioName: portfolio.name, roi: roi, balance: portfolio.balance }
  });
};
const Report = mongoose.model('Report', reportSchema);

module.exports = {
  User,
  Investor,
  SystemAdmin,
  Security,
  MarketData,
  Portfolio,
  Alert,
  Report
};
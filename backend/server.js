const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const dns = require('dns');
require('dotenv').config();

// Ensure reliable DNS resolution for MongoDB Atlas SRV records on Windows only
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    console.warn('Custom DNS set warning:', e.message);
  }
}

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stocktap_db';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serverless-aware Mongo Connection Cache
let cachedConn = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConn) {
    await cachedConn;
    return mongoose.connection;
  }

  cachedConn = mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  }).then(async (m) => {
    console.log(' Connected to MongoDB Atlas Successfully');
    await seedInitialData();
    return m;
  }).catch((err) => {
    cachedConn = null;
    console.error(' MongoDB Atlas Connection Error:', err.message);
    throw err;
  });

  await cachedConn;
  return mongoose.connection;
}

// Middleware to ensure DB is connected on every incoming API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection middleware warning:', err.message);
  }
  next();
});


// -------------------------------------------------------------
// MongoDB Schemas & Models
// -------------------------------------------------------------
const ProductSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String, default: 'General' },
  count: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  price: { type: Number, default: 0.0 },
  imageUri: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  previousCount: { type: Number, required: true },
  newCount: { type: Number, required: true },
  delta: { type: Number, required: true },
  reason: { type: String, default: 'Count update' },
  userId: { type: String, default: 'admin' },
  timestamp: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

// -------------------------------------------------------------
// Seed Initial Demo Products if Database is Empty
// -------------------------------------------------------------
async function seedInitialData() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const demoProducts = [
        {
          id: uuidv4(),
          name: 'Artisan Dark Roast Coffee',
          sku: 'COF-DR-001',
          category: 'Beverages',
          count: 14,
          lowStockThreshold: 5,
          price: 18.5,
          imageUri: 'https://images.unsplash.com/photo-1675306408031-a9aad9f23308?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMGJhZyUyMHByb2R1Y3R8ZW58MHx8fHwxNzg0NTUzNjE2fDA&ixlib=rb-4.1.0&q=85'
        },
        {
          id: uuidv4(),
          name: 'Heavyweight Heavy Tee (Black/L)',
          sku: 'APP-TS-002',
          category: 'Apparel',
          count: 3, // Low stock demo
          lowStockThreshold: 6,
          price: 34.0,
          imageUri: 'https://images.pexels.com/photos/31155535/pexels-photo-31155535.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
        },
        {
          id: uuidv4(),
          name: 'Stainless Precision Scale 5kg',
          sku: 'EQUIP-SC-003',
          category: 'Hardware',
          count: 0, // Out of stock demo
          lowStockThreshold: 2,
          price: 49.99,
          imageUri: 'https://images.unsplash.com/photo-1584294232067-c97f5d99eff3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxyZXRhaWwlMjBpbnZlbnRvcnklMjBzaGVsZiUyMGVtcHR5fGVufDB8fHx8MTc4NDU1MzYxN3ww&ixlib=rb-4.1.0&q=85'
        }
      ];
      await Product.insertMany(demoProducts);
      console.log(' Demo inventory seeded to MongoDB successfully');
    }
  } catch (err) {
    console.error(' Seeding warning:', err.message);
  }
}



// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------
const router = express.Router();

// Health Check
router.get('/', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    app: 'STOCKTAP Node.js & MongoDB API',
    version: '2.0.0',
    database: isConnected ? 'mongodb-connected' : 'mongodb-disconnected'
  });
});

// Authentication (PIN login)
router.post('/auth/login', (req, res) => {
  const { pin, username = 'admin' } = req.body;
  if (pin === '1234' || pin === '0000') {
    return res.json({
      success: true,
      token: `jwt-token-${uuidv4()}`,
      user: { username: username || 'admin', name: 'Store Manager', role: 'ADMIN' }
    });
  }
  return res.status(401).json({ detail: 'Invalid PIN. Use 1234 or 0000' });
});

// List Products
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    const products = await Product.find(query).sort({ updatedAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Product
router.post('/products', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = uuidv4();
    const product = new Product(data);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Single Product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ detail: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product
router.put('/products/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    );
    if (!product) return res.status(404).json({ detail: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product Count ("Tap-to-Count") + Audit Log
router.patch('/products/:id/count', async (req, res) => {
  try {
    const { count, reason = 'Quick Stock Tap', userId = 'admin' } = req.body;
    const existing = await Product.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({ detail: 'Product not found' });
    }

    const prevCount = existing.count;
    const nextCount = Math.max(0, count);

    existing.count = nextCount;
    existing.updatedAt = new Date();
    await existing.save();

    // Log the change
    await AuditLog.create({
      id: uuidv4(),
      productId: existing.id,
      productName: existing.name,
      sku: existing.sku,
      previousCount: prevCount,
      newCount: nextCount,
      delta: nextCount - prevCount,
      reason,
      userId,
      timestamp: new Date()
    });

    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product
router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ detail: 'Product not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics Summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const products = await Product.find();
    const totalUnits = products.reduce((sum, p) => sum + (p.count || 0), 0);
    const lowStock = products.filter(p => p.count <= (p.lowStockThreshold || 5) && p.count > 0).length;
    const outOfStock = products.filter(p => p.count === 0).length;
    const categories = [...new Set(products.map(p => p.category || 'General'))].filter(Boolean);

    res.json({
      totalProducts: products.length,
      totalStockUnits: totalUnits,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      categoriesCount: categories.length,
      categories
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Logs
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export
router.get('/export/csv', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    let csvContent = 'ID,Name,SKU,Category,Count,LowStockThreshold,Status,LastUpdated\n';
    
    for (const p of products) {
      const cnt = p.count || 0;
      const thresh = p.lowStockThreshold || 5;
      const status = cnt === 0 ? 'OUT_OF_STOCK' : (cnt <= thresh ? 'LOW_STOCK' : 'IN_STOCK');
      csvContent += `"${p.id}","${p.name}","${p.sku}","${p.category}",${cnt},${thresh},"${status}","${p.updatedAt}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=stocktap_inventory_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', router);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 StockTap Node.js & MongoDB Server running on port ${PORT}`);
  });
}

module.exports = app;


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Models for seed checks
import User from './models/User.js';
import MatchResult from './models/MatchResult.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Free Fire Tournament Platform API is running...' });
});

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Error Middleware fallbacks
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Seed Admins
const seedAdmin = async () => {
  try {
    // Ensure only specific users are admin
    await User.updateMany(
      { email: { $nin: ['alpha.ace.arena@gmail.com', 'alpha.ace.support@gmail.com'] }, role: 'admin' },
      { $set: { role: 'user' } }
    );

    const admins = [
      { email: 'alpha.ace.arena@gmail.com', password: 'alpha@ace@arena', name: 'Alpha Arena Admin', mobile: '9999999991', freeFireUid: 'ADMIN_ARENA' },
      { email: 'alpha.ace.support@gmail.com', password: 'alpha@ace@support', name: 'Alpha Support Admin', mobile: '9999999992', freeFireUid: 'ADMIN_SUPPORT' }
    ];

    for (const adminData of admins) {
      let adminUser = await User.findOne({ email: adminData.email });
      if (adminUser) {
        if (adminUser.role !== 'admin') {
          adminUser.role = 'admin';
        }
        // Force update password to match exactly what is required
        adminUser.password = adminData.password;
        await adminUser.save();
      } else {
        await User.create({
          name: adminData.name,
          mobile: adminData.mobile,
          email: adminData.email,
          password: adminData.password,
          role: 'admin',
          freeFireUid: adminData.freeFireUid,
        });
      }
    }
    console.log('Admin seeding completed. Only authorized admins have access.');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Setup periodic cleanup for match result screenshots (runs every 1 hour)
const startScreenshotCleanupJob = () => {
  const cleanup = async () => {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const result = await MatchResult.updateMany(
        {
          createdAt: { $lt: twoDaysAgo },
          screenshotUrl: { $ne: 'Deleted' }
        },
        {
          $set: { screenshotUrl: 'Deleted' }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[CLEANUP] Successfully removed ${result.modifiedCount} screenshots older than 2 days.`);
      }
    } catch (error) {
      console.error('[CLEANUP ERROR] Failed to clean up match result screenshots:', error);
    }
  };

  // Run initial cleanup immediately on startup
  cleanup();

  // Schedule to run every 1 hour
  setInterval(cleanup, 3600000); 
};

app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await seedAdmin();
  startScreenshotCleanupJob();
});

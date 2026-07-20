import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import Notification from '../models/Notification.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Simulate Razorpay Order Creation
 * @route   POST /api/payments/razorpay-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid deposit amount' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: 'receipt_order_' + Date.now(),
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send('Some error occurred');

    // Create a pending transaction
    await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      paymentMethod: 'UPI/Card',
      razorpayOrderId: order.id
    });

    res.status(200).json({
      orderId: order.id,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Server error generating deposit order' });
  }
};

/**
 * @desc    Simulate Razorpay Signature Verification
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment parameters' });
    }

    const transaction = await Transaction.findOne({ razorpayOrderId });
    if (!transaction) {
      return res.status(404).json({ message: 'Deposit record not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    const user = await User.findById(transaction.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      transaction.status = 'success';
      transaction.razorpayPaymentId = razorpayPaymentId;
      await transaction.save();

      user.walletBalance += transaction.amount;
      await user.save();

      await Notification.create({
        userId: user._id,
        title: 'Deposit Successful',
        message: `₹${transaction.amount} credited to your wallet via Razorpay.`,
        type: 'winning'
      });

      return res.status(200).json({
        message: 'Payment verified and credited successfully',
        walletBalance: user.walletBalance
      });
    } else {
      transaction.status = 'failed';
      await transaction.save();

      return res.status(400).json({
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error verifying deposit', error: error.message });
  }
};

/**
 * @desc    Submit withdrawal request
 * @route   POST /api/payments/withdraw
 * @access  Private
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please specify a valid withdrawal amount' });
    }

    if (!upiId) {
      return res.status(400).json({ message: 'Please specify a valid UPI ID / Account Details' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet immediately
    user.walletBalance -= amount;
    await user.save();

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      upiId,
      status: 'pending'
    });

    // Create transaction log
    await Transaction.create({
      userId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      paymentMethod: 'UPI',
      referenceId: withdrawal._id
    });

    // Send Notification
    await Notification.create({
      userId,
      title: 'Withdrawal Pending',
      message: `Your request to withdraw ₹${amount} is pending admin approval.`,
      type: 'withdrawal'
    });

    // Notify admins via email
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        if (admin.email) {
          await sendEmail({
            email: admin.email,
            subject: 'New Withdrawal Request',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #ff007f;">New Withdrawal Request</h2>
                <p>A user has requested a withdrawal. Here are the details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">User Name</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${user.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone Number</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${user.mobile}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">₹${amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">UPI ID</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${upiId}</td>
                  </tr>
                </table>
                <br/>
                <p>Please log in to the admin portal to process this request.</p>
              </div>
            `
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send withdrawal email notification to admins:', emailError);
    }

    res.status(200).json({
      message: 'Withdrawal request submitted successfully',
      walletBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Server error processing withdrawal', error: error.message });
  }
};

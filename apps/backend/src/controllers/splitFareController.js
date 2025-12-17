/**
 * Split Fare Controller
 * Handles fare splitting between multiple riders
 */

const { Trip, Rider, User, Payment } = require('../models');
const { Op } = require('sequelize');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
<<<<<<< HEAD
=======
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
>>>>>>> origin/main

// In-memory store for split fare invitations (in production, use Redis)
const splitFareInvitations = new Map();

/**
 * Initiate split fare request
 */
exports.initiateSplitFare = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { participants } = req.body; // Array of { email, phone, shareAmount or sharePercentage }

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return apiResponse.notFound(res, 'Rider');
    }

    const trip = await Trip.findOne({
      where: {
        id: tripId,
        riderId: rider.id,
        status: { [Op.in]: ['requested', 'accepted', 'driver_arrived', 'in_progress', 'completed'] }
      }
    });

    if (!trip) {
      return apiResponse.notFound(res, 'Trip');
    }

    // Validate participants
    if (!participants || participants.length === 0) {
      return apiResponse.badRequest(res, 'INVALID_PARTICIPANTS', 'At least one participant is required');
    }

    if (participants.length > 4) {
      return apiResponse.badRequest(res, 'TOO_MANY_PARTICIPANTS', 'Maximum 4 participants allowed');
    }

    // Calculate shares
    const totalFare = parseFloat(trip.totalFare);
    let assignedAmount = 0;
    const splitDetails = [];

    // Add trip owner as first participant
    splitDetails.push({
      riderId: rider.id,
      email: req.user.email,
      isOwner: true,
      status: 'accepted', // Owner automatically accepts
      shareAmount: 0, // Will be calculated after others
      paymentStatus: 'pending'
    });

    for (const participant of participants) {
      // Find participant by email or phone
      const participantUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: participant.email || '' },
            { phone: participant.phone || '' }
          ]
        }
      });

      let shareAmount;

      if (participant.shareAmount) {
        shareAmount = parseFloat(participant.shareAmount);
      } else if (participant.sharePercentage) {
        shareAmount = (totalFare * participant.sharePercentage) / 100;
      } else {
        // Equal split among all participants (including owner)
        shareAmount = totalFare / (participants.length + 1);
      }

      assignedAmount += shareAmount;

      splitDetails.push({
        riderId: participantUser ? await Rider.findOne({ where: { userId: participantUser.id } })?.id : null,
        userId: participantUser?.id,
        email: participant.email,
        phone: participant.phone,
        isOwner: false,
        status: 'pending', // Waiting for acceptance
        shareAmount: Math.round(shareAmount * 100) / 100,
        paymentStatus: 'pending'
      });
    }

    // Assign remaining amount to owner
    const ownerShare = totalFare - assignedAmount;
    if (ownerShare < 0) {
      return apiResponse.badRequest(
        res,
        'INVALID_SPLIT',
        'Total split amount exceeds fare amount'
      );
    }
    splitDetails[0].shareAmount = Math.round(ownerShare * 100) / 100;

    // Store split fare invitation
    const splitFareId = `split_${tripId}_${Date.now()}`;
    const invitation = {
      id: splitFareId,
      tripId,
      initiatorId: rider.id,
      totalFare,
      participants: splitDetails,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    splitFareInvitations.set(splitFareId, invitation);

    // Send notifications to participants
    const io = req.app.get('io');
    for (const participant of splitDetails) {
      if (!participant.isOwner && participant.userId) {
        io?.to(`user:${participant.userId}`).emit('split-fare:invitation', {
          splitFareId,
          tripId,
          shareAmount: participant.shareAmount,
          initiator: {
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email
          }
        });
      }
<<<<<<< HEAD
      // TODO: Send SMS/email to non-registered users
=======
      // Send SMS/email to non-registered users
      if (!participant.userId) {
        const trip = await Trip.findByPk(tripId);
        if (participant.email) {
          await emailService.sendSplitFareInvitation(
            participant.email,
            req.user,
            trip,
            participant.shareAmount
          );
        }
        if (participant.phone) {
          await smsService.sendSplitFareInvitation(
            participant.phone,
            req.user.firstName || 'Someone',
            participant.shareAmount
          );
        }
      }
>>>>>>> origin/main
    }

    return apiResponse.created(res, {
      splitFareId,
      tripId,
      totalFare,
      participants: splitDetails.map(p => ({
        email: p.email,
        phone: p.phone,
        isOwner: p.isOwner,
        shareAmount: p.shareAmount,
        status: p.status
      }))
    }, 'Split fare request created successfully');
  } catch (error) {
    logger.error('Initiate split fare error:', error);
    return apiResponse.serverError(res, 'Failed to initiate split fare');
  }
};

/**
 * Get split fare details
 */
exports.getSplitFareDetails = async (req, res) => {
  try {
    const { splitFareId } = req.params;

    const invitation = splitFareInvitations.get(splitFareId);

    if (!invitation) {
      return apiResponse.notFound(res, 'Split fare request');
    }

    // Check if user is part of this split
    const userEmail = req.user.email;
    const isParticipant = invitation.participants.some(
      p => p.email === userEmail || (p.riderId && p.riderId === req.user.riderId)
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return apiResponse.forbidden(res);
    }

    const trip = await Trip.findByPk(invitation.tripId, {
      attributes: ['id', 'pickupAddress', 'dropoffAddress', 'vehicleType', 'status', 'completedAt']
    });

    return apiResponse.success(res, {
      ...invitation,
      trip
    });
  } catch (error) {
    logger.error('Get split fare details error:', error);
    return apiResponse.serverError(res, 'Failed to get split fare details');
  }
};

/**
 * Accept split fare invitation
 */
exports.acceptSplitFare = async (req, res) => {
  try {
    const { splitFareId } = req.params;

    const invitation = splitFareInvitations.get(splitFareId);

    if (!invitation) {
      return apiResponse.notFound(res, 'Split fare request');
    }

    if (new Date() > invitation.expiresAt) {
      return apiResponse.badRequest(res, 'EXPIRED', 'Split fare invitation has expired');
    }

    // Find participant
    const participantIndex = invitation.participants.findIndex(
      p => p.email === req.user.email && !p.isOwner
    );

    if (participantIndex === -1) {
      return apiResponse.forbidden(res, 'You are not part of this split fare request');
    }

    if (invitation.participants[participantIndex].status === 'accepted') {
      return apiResponse.badRequest(res, 'ALREADY_ACCEPTED', 'You have already accepted this invitation');
    }

    // Update participant status
    invitation.participants[participantIndex].status = 'accepted';

    // Link rider if not already linked
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (rider) {
      invitation.participants[participantIndex].riderId = rider.id;
    }

    // Check if all participants have accepted
    const allAccepted = invitation.participants.every(p => p.status === 'accepted');
    if (allAccepted) {
      invitation.status = 'active';
    }

    splitFareInvitations.set(splitFareId, invitation);

    // Notify initiator
    const io = req.app.get('io');
    const initiatorRider = await Rider.findByPk(invitation.initiatorId);
    if (initiatorRider) {
      io?.to(`user:${initiatorRider.userId}`).emit('split-fare:accepted', {
        splitFareId,
        acceptedBy: req.user.email
      });
    }

    return apiResponse.success(res, {
      splitFareId,
      status: invitation.status,
      yourShare: invitation.participants[participantIndex].shareAmount
    }, 'Split fare accepted successfully');
  } catch (error) {
    logger.error('Accept split fare error:', error);
    return apiResponse.serverError(res, 'Failed to accept split fare');
  }
};

/**
 * Decline split fare invitation
 */
exports.declineSplitFare = async (req, res) => {
  try {
    const { splitFareId } = req.params;

    const invitation = splitFareInvitations.get(splitFareId);

    if (!invitation) {
      return apiResponse.notFound(res, 'Split fare request');
    }

    // Find participant
    const participantIndex = invitation.participants.findIndex(
      p => p.email === req.user.email && !p.isOwner
    );

    if (participantIndex === -1) {
      return apiResponse.forbidden(res, 'You are not part of this split fare request');
    }

    // Update participant status
    invitation.participants[participantIndex].status = 'declined';

    // Redistribute declined amount to owner
    const declinedAmount = invitation.participants[participantIndex].shareAmount;
    const ownerIndex = invitation.participants.findIndex(p => p.isOwner);
    invitation.participants[ownerIndex].shareAmount += declinedAmount;
    invitation.participants[participantIndex].shareAmount = 0;

    splitFareInvitations.set(splitFareId, invitation);

    // Notify initiator
    const io = req.app.get('io');
    const initiatorRider = await Rider.findByPk(invitation.initiatorId);
    if (initiatorRider) {
      io?.to(`user:${initiatorRider.userId}`).emit('split-fare:declined', {
        splitFareId,
        declinedBy: req.user.email,
        newOwnerShare: invitation.participants[ownerIndex].shareAmount
      });
    }

    return apiResponse.success(res, {
      splitFareId,
      message: 'Split fare declined'
    });
  } catch (error) {
    logger.error('Decline split fare error:', error);
    return apiResponse.serverError(res, 'Failed to decline split fare');
  }
};

/**
 * Pay split fare share
 */
exports.paySplitFareShare = async (req, res) => {
  try {
    const { splitFareId } = req.params;
    const { paymentMethod, paymentToken } = req.body;

    const invitation = splitFareInvitations.get(splitFareId);

    if (!invitation) {
      return apiResponse.notFound(res, 'Split fare request');
    }

    // Find participant
    const participantIndex = invitation.participants.findIndex(
      p => p.email === req.user.email
    );

    if (participantIndex === -1) {
      return apiResponse.forbidden(res, 'You are not part of this split fare request');
    }

    const participant = invitation.participants[participantIndex];

    if (participant.status !== 'accepted') {
      return apiResponse.badRequest(res, 'NOT_ACCEPTED', 'You must accept the split fare first');
    }

    if (participant.paymentStatus === 'completed') {
      return apiResponse.badRequest(res, 'ALREADY_PAID', 'You have already paid your share');
    }

<<<<<<< HEAD
    // Process payment (simplified - in production, use Stripe)
    // TODO: Integrate with actual payment processor
    const paymentSuccess = true; // Simulated payment
=======
    // Process payment with Stripe
    let paymentSuccess = false;
    let stripePaymentId = null;

    try {
      if (paymentMethod === 'card' && paymentToken) {
        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(participant.shareAmount * 100), // Convert to cents
          currency: 'usd',
          payment_method: paymentToken,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
          },
          metadata: {
            splitFareId,
            tripId: invitation.tripId,
            userId: req.user.id,
            type: 'split_fare'
          }
        });

        paymentSuccess = paymentIntent.status === 'succeeded';
        stripePaymentId = paymentIntent.id;
      } else if (paymentMethod === 'wallet') {
        // For wallet payments, deduct from user's wallet balance
        // This would integrate with your wallet system
        paymentSuccess = true;
      } else if (paymentMethod === 'cash') {
        // Cash payments are marked as pending until confirmed
        paymentSuccess = true;
      }
    } catch (stripeError) {
      logger.error('Stripe payment error:', stripeError);
      return apiResponse.badRequest(res, 'PAYMENT_FAILED', stripeError.message || 'Payment processing failed');
    }
>>>>>>> origin/main

    if (paymentSuccess) {
      invitation.participants[participantIndex].paymentStatus = 'completed';
      invitation.participants[participantIndex].paidAt = new Date();
      invitation.participants[participantIndex].paymentMethod = paymentMethod;
<<<<<<< HEAD
=======
      invitation.participants[participantIndex].stripePaymentId = stripePaymentId;
>>>>>>> origin/main

      // Check if all payments are complete
      const allPaid = invitation.participants
        .filter(p => p.status === 'accepted')
        .every(p => p.paymentStatus === 'completed');

      if (allPaid) {
        invitation.status = 'completed';

        // Update trip payment status
        await Payment.update(
          { status: 'completed', paidAt: new Date() },
          { where: { tripId: invitation.tripId } }
        );
      }

      splitFareInvitations.set(splitFareId, invitation);

      // Notify others
      const io = req.app.get('io');
      invitation.participants.forEach(p => {
        if (p.userId && p.email !== req.user.email) {
          io?.to(`user:${p.userId}`).emit('split-fare:payment', {
            splitFareId,
            paidBy: req.user.email,
            amount: participant.shareAmount,
            allPaid
          });
        }
      });

      return apiResponse.success(res, {
        splitFareId,
        amountPaid: participant.shareAmount,
        allParticipantsPaid: allPaid,
        splitStatus: invitation.status
      }, 'Payment successful');
    } else {
      return apiResponse.badRequest(res, 'PAYMENT_FAILED', 'Payment processing failed');
    }
  } catch (error) {
    logger.error('Pay split fare share error:', error);
    return apiResponse.serverError(res, 'Failed to process payment');
  }
};

/**
 * Cancel split fare
 */
exports.cancelSplitFare = async (req, res) => {
  try {
    const { splitFareId } = req.params;

    const invitation = splitFareInvitations.get(splitFareId);

    if (!invitation) {
      return apiResponse.notFound(res, 'Split fare request');
    }

    const rider = await Rider.findOne({ where: { userId: req.user.id } });

    if (!rider || invitation.initiatorId !== rider.id) {
      return apiResponse.forbidden(res, 'Only the initiator can cancel the split fare');
    }

    if (invitation.status === 'completed') {
      return apiResponse.badRequest(res, 'CANNOT_CANCEL', 'Cannot cancel a completed split fare');
    }

    // Check if any payments have been made
    const hasPaidParticipants = invitation.participants.some(
      p => p.paymentStatus === 'completed' && !p.isOwner
    );

    if (hasPaidParticipants) {
      return apiResponse.badRequest(
        res,
        'CANNOT_CANCEL',
        'Cannot cancel split fare after participants have paid. Please process refunds first.'
      );
    }

    invitation.status = 'cancelled';
    splitFareInvitations.set(splitFareId, invitation);

    // Notify participants
    const io = req.app.get('io');
    invitation.participants.forEach(p => {
      if (p.userId && !p.isOwner) {
        io?.to(`user:${p.userId}`).emit('split-fare:cancelled', {
          splitFareId
        });
      }
    });

    return apiResponse.success(res, { splitFareId }, 'Split fare cancelled successfully');
  } catch (error) {
    logger.error('Cancel split fare error:', error);
    return apiResponse.serverError(res, 'Failed to cancel split fare');
  }
};

/**
 * Get user's split fare history
 */
exports.getSplitFareHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    const userEmail = req.user.email;

    // Filter invitations where user is a participant
    const userInvitations = [];
    splitFareInvitations.forEach((invitation, id) => {
      const isParticipant = invitation.participants.some(
        p => p.email === userEmail || (rider && p.riderId === rider.id)
      );

      if (isParticipant) {
        if (!status || invitation.status === status) {
          userInvitations.push({ id, ...invitation });
        }
      }
    });

    // Sort by creation date (newest first)
    userInvitations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = userInvitations.length;
    const paginatedInvitations = userInvitations.slice(offset, offset + parseInt(limit));

    return apiResponse.paginated(
      res,
      paginatedInvitations,
      { total, page, limit },
      'splitFares'
    );
  } catch (error) {
    logger.error('Get split fare history error:', error);
    return apiResponse.serverError(res, 'Failed to get split fare history');
  }
};

module.exports = exports;

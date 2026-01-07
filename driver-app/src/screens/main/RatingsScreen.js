import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

export default function RatingsScreen() {
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, reviews, badges

  const ratingStats = {
    overall: 4.8,
    totalRatings: 487,
    breakdown: {
      5: 387,
      4: 75,
      3: 18,
      2: 5,
      1: 2,
    },
    trend: 'up', // up, down, neutral
    change: 0.2, // Change from last month
  };

  const recentReviews = [
    {
      id: 1,
      rider: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent driver! Very professional and friendly. Car was clean and comfortable.',
      date: '2025-12-06',
      tripType: 'Standard',
    },
    {
      id: 2,
      rider: 'Michael Chen',
      rating: 5,
      comment: 'Great service, arrived on time and took the best route.',
      date: '2025-12-05',
      tripType: 'Premium',
    },
    {
      id: 3,
      rider: 'Emma Wilson',
      rating: 4,
      comment: 'Good ride, driver was quiet which I appreciated.',
      date: '2025-12-04',
      tripType: 'Standard',
    },
    {
      id: 4,
      rider: 'David Brown',
      rating: 5,
      comment: 'Very safe driver, followed all traffic rules. Highly recommend!',
      date: '2025-12-03',
      tripType: 'XL',
    },
    {
      id: 5,
      rider: 'Lisa Martinez',
      rating: 3,
      comment: 'Ride was okay, but took a longer route than expected.',
      date: '2025-12-02',
      tripType: 'Standard',
    },
  ];

  const badges = [
    {
      id: 1,
      name: 'Clean Car Champion',
      icon: 'sparkles',
      color: '#10B981',
      count: 150,
      description: 'Received 150 compliments for car cleanliness',
      earned: true,
    },
    {
      id: 2,
      name: 'Smooth Rider',
      icon: 'speedometer',
      color: '#3B82F6',
      count: 200,
      description: 'Praised for smooth driving 200 times',
      earned: true,
    },
    {
      id: 3,
      name: 'Conversation Master',
      icon: 'chatbubbles',
      color: '#F59E0B',
      count: 75,
      description: 'Great conversation skills mentioned 75 times',
      earned: true,
    },
    {
      id: 4,
      name: 'Punctuality Pro',
      icon: 'time',
      color: '#8B5CF6',
      count: 300,
      description: 'Always on time - 300 mentions',
      earned: true,
    },
    {
      id: 5,
      name: 'Route Expert',
      icon: 'map',
      color: '#EF4444',
      count: 120,
      description: 'Knows the best routes - 120 compliments',
      earned: true,
    },
    {
      id: 6,
      name: 'Safety First',
      icon: 'shield-checkmark',
      color: '#06B6D4',
      count: 45,
      description: 'Need 5 more mentions for safety',
      earned: false,
      progress: 45,
      target: 50,
    },
  ];

  const getTotalRatings = () => {
    return Object.values(ratingStats.breakdown).reduce((a, b) => a + b, 0);
  };

  const getRatingPercentage = (count) => {
    const total = getTotalRatings();
    return ((count / total) * 100).toFixed(1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ratings & Feedback</Text>
        <Text style={styles.headerSubtitle}>See what riders say about you</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]}
          onPress={() => setSelectedTab('reviews')}
        >
          <Text style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}>
            Reviews
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'badges' && styles.activeTab]}
          onPress={() => setSelectedTab('badges')}
        >
          <Text style={[styles.tabText, selectedTab === 'badges' && styles.activeTabText]}>
            Badges
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && (
          <>
            {/* Overall Rating Card */}
            <View style={styles.overallCard}>
              <View style={styles.overallLeft}>
                <Text style={styles.overallRating}>{ratingStats.overall.toFixed(1)}</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.round(ratingStats.overall) ? 'star' : 'star-outline'}
                      size={24}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                <Text style={styles.overallCount}>{ratingStats.totalRatings} ratings</Text>
              </View>

              <View style={styles.trendBadge}>
                <Ionicons
                  name={ratingStats.trend === 'up' ? 'trending-up' : 'trending-down'}
                  size={20}
                  color={ratingStats.trend === 'up' ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.trendText,
                    { color: ratingStats.trend === 'up' ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {ratingStats.change.toFixed(1)} this month
                </Text>
              </View>
            </View>

            {/* Rating Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.sectionTitle}>Rating Breakdown</Text>
              {[5, 4, 3, 2, 1].map((rating) => (
                <View key={rating} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{rating} ⭐</Text>
                  <ProgressBar
                    progress={ratingStats.breakdown[rating] / getTotalRatings()}
                    color="#F59E0B"
                    style={styles.breakdownBar}
                  />
                  <Text style={styles.breakdownCount}>
                    {getRatingPercentage(ratingStats.breakdown[rating])}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Improvement Tips */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={24} color="#F59E0B" />
                <Text style={styles.tipsTitle}>Tips to Improve</Text>
              </View>
              <View style={styles.tip}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Greet passengers warmly and confirm their destination</Text>
              </View>
              <View style={styles.tip}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Keep your vehicle clean and comfortable</Text>
              </View>
              <View style={styles.tip}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Use navigation for optimal routes</Text>
              </View>
              <View style={styles.tip}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Drive smoothly and follow traffic rules</Text>
              </View>
            </View>
          </>
        )}

        {selectedTab === 'reviews' && (
          <>
            {recentReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitial}>{review.rider.charAt(0)}</Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.rider}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={16}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                    <View style={styles.tripTypeBadge}>
                      <Text style={styles.tripTypeText}>{review.tripType}</Text>
                    </View>
                  </View>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {selectedTab === 'badges' && (
          <>
            <View style={styles.badgesGrid}>
              {badges.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    !badge.earned && styles.badgeCardLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIcon,
                      { backgroundColor: badge.earned ? `${badge.color}20` : '#F3F4F6' },
                    ]}
                  >
                    <Ionicons
                      name={badge.icon}
                      size={32}
                      color={badge.earned ? badge.color : '#9CA3AF'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.badgeName,
                      !badge.earned && styles.badgeNameLocked,
                    ]}
                  >
                    {badge.name}
                  </Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  {!badge.earned && badge.progress && (
                    <View style={styles.badgeProgress}>
                      <ProgressBar
                        progress={badge.progress / badge.target}
                        color={badge.color}
                        style={styles.badgeProgressBar}
                      />
                      <Text style={styles.badgeProgressText}>
                        {badge.progress}/{badge.target}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#160832',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#160832',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  overallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overallLeft: {
    alignItems: 'center',
  },
  overallRating: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  overallCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  breakdownLabel: {
    width: 40,
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  breakdownCount: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 7,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#160832',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  tripTypeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tripTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeNameLocked: {
    color: '#9CA3AF',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeProgress: {
    width: '100%',
    marginTop: 12,
  },
  badgeProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginBottom: 4,
  },
  badgeProgressText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
});

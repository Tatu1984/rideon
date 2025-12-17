import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Share, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverAPI } from '../../services/api.service';

const REFERRAL_TIERS = [
  { min: 0, max: 4, name: 'Starter', bonus: 50, color: '#6B7280' },
  { min: 5, max: 9, name: 'Bronze', bonus: 75, color: '#CD7F32' },
  { min: 10, max: 19, name: 'Silver', bonus: 100, color: '#C0C0C0' },
  { min: 20, max: 49, name: 'Gold', bonus: 150, color: '#FFD700' },
  { min: 50, max: Infinity, name: 'Platinum', bonus: 200, color: '#E5E4E2' },
];

export default function ReferralScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [referralInfo, setReferralInfo] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('invite');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [infoRes, historyRes] = await Promise.all([driverAPI.getReferralInfo(), driverAPI.getReferralHistory()]);
      if (infoRes.data?.success) setReferralInfo(infoRes.data.data || { code: 'DRIVER' + Math.random().toString(36).substr(2, 6).toUpperCase(), totalReferrals: 0, pendingReferrals: 0, totalEarnings: 0 });
      if (historyRes.data?.success) setReferralHistory(historyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setReferralInfo({ code: 'DRIVER' + Math.random().toString(36).substr(2, 6).toUpperCase(), totalReferrals: 0, pendingReferrals: 0, totalEarnings: 0 });
    }
    finally { setLoading(false); }
  };

  const getCurrentTier = () => REFERRAL_TIERS.find(t => (referralInfo?.totalReferrals || 0) >= t.min && (referralInfo?.totalReferrals || 0) <= t.max) || REFERRAL_TIERS[0];
  const getNextTier = () => { const idx = REFERRAL_TIERS.indexOf(getCurrentTier()); return idx < REFERRAL_TIERS.length - 1 ? REFERRAL_TIERS[idx + 1] : null; };

  const handleCopyCode = () => {
    Clipboard.setString(referralInfo?.code || '');
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on RideOn and start earning! Use my referral code ${referralInfo?.code} when you sign up to get a bonus. Download now: https://rideon.app/driver`,
        title: 'Join RideOn',
      });
    } catch (error) { console.error('Error sharing:', error); }
  };

  const handleSendInvite = async (type) => {
    const value = type === 'email' ? inviteEmail : invitePhone;
    if (!value.trim()) { Alert.alert('Error', `Please enter a valid ${type}`); return; }
    if (type === 'email' && !value.includes('@')) { Alert.alert('Error', 'Please enter a valid email address'); return; }
    setSending(true);
    try {
      const response = await driverAPI.sendReferralInvite({ type, value, code: referralInfo?.code });
      if (response.data?.success) {
        Alert.alert('Success', `Invitation sent to ${value}`);
        if (type === 'email') setInviteEmail(''); else setInvitePhone('');
      } else { Alert.alert('Error', response.data?.message || 'Failed to send invitation'); }
    } catch (error) { Alert.alert('Error', 'Failed to send invitation'); }
    finally { setSending(false); }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7C3AED" /></View>;

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progress = nextTier ? ((referralInfo?.totalReferrals || 0) - currentTier.min) / (nextTier.min - currentTier.min) * 100 : 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Refer Friends, Earn Cash</Text>
          <Text style={styles.heroSubtitle}>Earn ${currentTier.bonus} for every driver who signs up with your code</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{referralInfo?.totalReferrals || 0}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{referralInfo?.pendingReferrals || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${referralInfo?.totalEarnings || 0}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{referralInfo?.code || '------'}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
            <Ionicons name="copy-outline" size={20} color="#7C3AED" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share with Friends</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tierCard}>
        <View style={styles.tierHeader}>
          <View>
            <Text style={styles.tierLabel}>Current Tier</Text>
            <Text style={[styles.tierName, { color: currentTier.color }]}>{currentTier.name}</Text>
          </View>
          <View style={styles.tierBonusContainer}>
            <Text style={styles.tierBonusLabel}>Bonus per referral</Text>
            <Text style={styles.tierBonusValue}>${currentTier.bonus}</Text>
          </View>
        </View>
        {nextTier && (
          <View style={styles.tierProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{nextTier.min - (referralInfo?.totalReferrals || 0)} more referrals to reach {nextTier.name}</Text>
          </View>
        )}
        <View style={styles.tiersList}>
          {REFERRAL_TIERS.map((tier, idx) => (
            <View key={tier.name} style={[styles.tierItem, tier.name === currentTier.name && styles.tierItemActive]}>
              <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
              <Text style={styles.tierItemName}>{tier.name}</Text>
              <Text style={styles.tierItemBonus}>${tier.bonus}/ref</Text>
              <Text style={styles.tierItemReq}>{tier.min}+ refs</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'invite' && styles.tabActive]} onPress={() => setActiveTab('invite')}>
          <Text style={[styles.tabText, activeTab === 'invite' && styles.tabTextActive]}>Invite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.tabActive]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'invite' ? (
        <View style={styles.inviteSection}>
          <View style={styles.inviteCard}>
            <Text style={styles.inviteLabel}>Invite by Email</Text>
            <View style={styles.inviteRow}>
              <TextInput style={styles.inviteInput} value={inviteEmail} onChangeText={setInviteEmail} placeholder="friend@email.com" keyboardType="email-address" autoCapitalize="none" />
              <TouchableOpacity style={[styles.inviteSendButton, sending && styles.inviteSendButtonDisabled]} onPress={() => handleSendInvite('email')} disabled={sending}>
                {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inviteCard}>
            <Text style={styles.inviteLabel}>Invite by SMS</Text>
            <View style={styles.inviteRow}>
              <TextInput style={styles.inviteInput} value={invitePhone} onChangeText={setInvitePhone} placeholder="+1 (555) 123-4567" keyboardType="phone-pad" />
              <TouchableOpacity style={[styles.inviteSendButton, sending && styles.inviteSendButtonDisabled]} onPress={() => handleSendInvite('phone')} disabled={sending}>
                {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.historySection}>
          {referralHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No referrals yet</Text>
              <Text style={styles.emptySubtext}>Start inviting friends to earn bonuses</Text>
            </View>
          ) : (
            referralHistory.map((ref, idx) => (
              <View key={idx} style={styles.historyCard}>
                <View style={styles.historyAvatar}>
                  <Text style={styles.historyAvatarText}>{ref.name?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{ref.name || 'Driver'}</Text>
                  <Text style={styles.historyDate}>Joined {formatDate(ref.joinedAt || ref.createdAt)}</Text>
                </View>
                <View style={styles.historyStatus}>
                  <View style={[styles.historyBadge, { backgroundColor: ref.status === 'completed' ? '#ECFDF5' : ref.status === 'pending' ? '#FEF3C7' : '#FEE2E2' }]}>
                    <Text style={[styles.historyBadgeText, { color: ref.status === 'completed' ? '#10B981' : ref.status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
                      {ref.status === 'completed' ? 'Earned' : ref.status === 'pending' ? 'Pending' : 'Expired'}
                    </Text>
                  </View>
                  {ref.status === 'completed' && <Text style={styles.historyEarning}>+${ref.bonus || currentTier.bonus}</Text>}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <View style={styles.howItWorks}>
        <Text style={styles.howItWorksTitle}>How It Works</Text>
        {[
          { icon: 'share-outline', title: 'Share Your Code', desc: 'Send your unique code to friends interested in driving' },
          { icon: 'person-add-outline', title: 'They Sign Up', desc: 'Your friend registers as a driver using your code' },
          { icon: 'car-outline', title: 'They Complete Trips', desc: 'Once they complete their first 10 trips' },
          { icon: 'cash-outline', title: 'You Both Earn', desc: 'You and your friend each receive a bonus!' },
        ].map((step, idx) => (
          <View key={idx} style={styles.stepItem}>
            <View style={styles.stepIconContainer}>
              <Ionicons name={step.icon} size={24} color="#7C3AED" />
              {idx < 3 && <View style={styles.stepLine} />}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroCard: { backgroundColor: '#7C3AED', margin: 16, borderRadius: 16, overflow: 'hidden' },
  heroContent: { padding: 20 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  codeCard: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 20, borderRadius: 12 },
  codeLabel: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  codeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  codeText: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', letterSpacing: 4 },
  copyButton: { marginLeft: 12, padding: 8 },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED', padding: 14, borderRadius: 12, marginTop: 16, gap: 8 },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  tierCard: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierLabel: { fontSize: 12, color: '#6B7280' },
  tierName: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  tierBonusContainer: { alignItems: 'flex-end' },
  tierBonusLabel: { fontSize: 11, color: '#6B7280' },
  tierBonusValue: { fontSize: 20, fontWeight: 'bold', color: '#10B981' },
  tierProgress: { marginTop: 16 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  tiersList: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  tierItem: { alignItems: 'center', opacity: 0.5 },
  tierItemActive: { opacity: 1 },
  tierDot: { width: 12, height: 12, borderRadius: 6 },
  tierItemName: { fontSize: 10, fontWeight: '600', color: '#374151', marginTop: 4 },
  tierItemBonus: { fontSize: 10, color: '#6B7280' },
  tierItemReq: { fontSize: 9, color: '#9CA3AF' },
  tabsContainer: { flexDirection: 'row', margin: 16, marginBottom: 0, backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#7C3AED' },
  inviteSection: { padding: 16 },
  inviteCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  inviteLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12 },
  inviteRow: { flexDirection: 'row', gap: 12 },
  inviteInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16 },
  inviteSendButton: { width: 48, height: 48, backgroundColor: '#7C3AED', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inviteSendButtonDisabled: { opacity: 0.7 },
  historySection: { padding: 16 },
  emptyState: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  historyAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  historyAvatarText: { fontSize: 18, fontWeight: '600', color: '#7C3AED' },
  historyInfo: { flex: 1, marginLeft: 12 },
  historyName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  historyDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  historyStatus: { alignItems: 'flex-end' },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  historyBadgeText: { fontSize: 11, fontWeight: '600' },
  historyEarning: { fontSize: 14, fontWeight: '600', color: '#10B981', marginTop: 4 },
  howItWorks: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12 },
  howItWorksTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  stepItem: { flexDirection: 'row', marginBottom: 16 },
  stepIconContainer: { alignItems: 'center', marginRight: 16 },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 8 },
  stepContent: { flex: 1, paddingBottom: 8 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  stepDesc: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  bottomPadding: { height: 32 },
});

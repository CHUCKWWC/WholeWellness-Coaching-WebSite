import { v4 as uuidv4 } from 'uuid';
import {
  User, InsertUser, Donation, InsertDonation, Campaign, InsertCampaign,
  RewardTransaction, InsertRewardTransaction, MemberBenefit, ImpactMetric, DonationPreset
} from '@shared/donation-schema';

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export class DonationMemoryStorage {
  private users = new Map<string, User>();
  private donations = new Map<string, Donation>();
  private campaigns = new Map<string, Campaign>();
  private sessions = new Map<string, Session>();
  private rewardTransactions = new Map<string, RewardTransaction>();
  private memberBenefits = new Map<string, MemberBenefit>();
  private impactMetrics = new Map<string, ImpactMetric>();
  private donationPresets = new Map<string, DonationPreset>();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed donation presets
    const presets = [
      {
        id: uuidv4(),
        amount: "25",
        label: "Supporter",
        description: "Fund one coaching session",
        icon: "heart",
        isPopular: false,
        sortOrder: 1,
        isActive: true
      },
      {
        id: uuidv4(),
        amount: "50",
        label: "Advocate",
        description: "Support weekly resources",
        icon: "star",
        isPopular: true,
        sortOrder: 2,
        isActive: true
      },
      {
        id: uuidv4(),
        amount: "100",
        label: "Champion",
        description: "Fund complete program",
        icon: "gift",
        isPopular: false,
        sortOrder: 3,
        isActive: true
      },
      {
        id: uuidv4(),
        amount: "250",
        label: "Guardian",
        description: "Transform multiple lives",
        icon: "sparkles",
        isPopular: false,
        sortOrder: 4,
        isActive: true
      }
    ];

    presets.forEach(preset => this.donationPresets.set(preset.id, preset));

    // Seed campaigns
    const campaigns = [
      {
        id: uuidv4(),
        title: "Emergency Support Fund",
        description: "Immediate assistance for domestic violence survivors",
        goalAmount: "10000",
        raisedAmount: "3500",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        imageUrl: null,
        category: "emergency",
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: "Holiday Support Program",
        description: "Bringing joy and stability during the holidays",
        goalAmount: "5000",
        raisedAmount: "2100",
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        imageUrl: null,
        category: "program",
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    campaigns.forEach(campaign => this.campaigns.set(campaign.id, campaign));

    // Seed member benefits
    const benefits = [
      {
        id: uuidv4(),
        membershipLevel: "supporter",
        title: "Monthly Newsletter",
        description: "Exclusive updates and success stories",
        icon: "mail",
        isActive: true,
        sortOrder: 1
      },
      {
        id: uuidv4(),
        membershipLevel: "champion",
        title: "Priority Support",
        description: "Fast-track access to coaching resources",
        icon: "zap",
        isActive: true,
        sortOrder: 2
      },
      {
        id: uuidv4(),
        membershipLevel: "guardian",
        title: "VIP Events",
        description: "Exclusive access to donor appreciation events",
        icon: "star",
        isActive: true,
        sortOrder: 3
      }
    ];

    benefits.forEach(benefit => this.memberBenefits.set(benefit.id, benefit));
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(userData: InsertUser & { id: string; passwordHash: string }): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      joinDate: new Date(),
      lastLogin: null
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Session methods
  async createSession(sessionData: { id: string; userId: string; token: string; expiresAt: Date }): Promise<Session> {
    const session = { ...sessionData };
    this.sessions.set(session.token, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return this.sessions.get(token);
  }

  async deleteSession(id: string): Promise<void> {
    const session = Array.from(this.sessions.values()).find(s => s.id === id);
    if (session) {
      this.sessions.delete(session.token);
    }
  }

  // Donation methods
  async getDonationPresets(): Promise<DonationPreset[]> {
    return Array.from(this.donationPresets.values())
      .filter(preset => preset.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.isActive && (!campaign.endDate || campaign.endDate > new Date()));
  }

  async createDonation(donationData: InsertDonation & { id: string; userId: string }): Promise<Donation> {
    const donation: Donation = {
      ...donationData,
      createdAt: new Date(),
      processedAt: null
    };
    this.donations.set(donation.id, donation);
    return donation;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) return undefined;

    const updatedDonation = { ...donation, ...updates };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }

  async getDonationById(id: string): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getDonationsByUserId(userId: string): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(donation => donation.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Member dashboard methods
  async getImpactMetricsByUserId(userId: string): Promise<ImpactMetric[]> {
    return Array.from(this.impactMetrics.values())
      .filter(metric => metric.userId === userId);
  }

  async getMemberBenefitsByLevel(membershipLevel: string): Promise<MemberBenefit[]> {
    const levelHierarchy = ['free', 'supporter', 'champion', 'guardian'];
    const userLevelIndex = levelHierarchy.indexOf(membershipLevel);
    
    return Array.from(this.memberBenefits.values())
      .filter(benefit => {
        const benefitLevelIndex = levelHierarchy.indexOf(benefit.membershipLevel);
        return benefitLevelIndex <= userLevelIndex;
      })
      .map(benefit => ({
        ...benefit,
        isUnlocked: levelHierarchy.indexOf(benefit.membershipLevel) <= userLevelIndex,
        requiredLevel: benefit.membershipLevel
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Reward system methods
  async createRewardTransaction(transactionData: InsertRewardTransaction & { id: string }): Promise<RewardTransaction> {
    const transaction: RewardTransaction = {
      ...transactionData,
      createdAt: new Date()
    };
    this.rewardTransactions.set(transaction.id, transaction);
    return transaction;
  }

  // Impact tracking
  async updateImpactMetrics(userId: string, donation: Donation): Promise<void> {
    const amount = parseFloat(donation.amount);
    
    // Calculate lives impacted (rough estimate: $25 = 1 life impacted)
    const livesImpacted = Math.floor(amount / 25);
    
    // Update or create lives impacted metric
    let livesMetric = Array.from(this.impactMetrics.values())
      .find(m => m.userId === userId && m.metric === 'lives_impacted');
    
    if (livesMetric) {
      livesMetric.value += livesImpacted;
      livesMetric.lastUpdated = new Date();
    } else {
      livesMetric = {
        id: uuidv4(),
        userId,
        metric: 'lives_impacted',
        value: livesImpacted,
        period: 'all-time',
        lastUpdated: new Date()
      };
      this.impactMetrics.set(livesMetric.id, livesMetric);
    }

    // Update sessions supported metric
    const sessionsSupported = Math.floor(amount / 25);
    let sessionsMetric = Array.from(this.impactMetrics.values())
      .find(m => m.userId === userId && m.metric === 'sessions_supported');
    
    if (sessionsMetric) {
      sessionsMetric.value += sessionsSupported;
      sessionsMetric.lastUpdated = new Date();
    } else {
      sessionsMetric = {
        id: uuidv4(),
        userId,
        metric: 'sessions_supported',
        value: sessionsSupported,
        period: 'all-time',
        lastUpdated: new Date()
      };
      this.impactMetrics.set(sessionsMetric.id, sessionsMetric);
    }
  }
}

export const donationStorage = new DonationMemoryStorage();
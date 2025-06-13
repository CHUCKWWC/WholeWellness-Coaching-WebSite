import {
  coaches,
  coachCredentials,
  coachBanking,
  coachAvailability,
  coachClients,
  coachSessionNotes,
  coachMessageTemplates,
  coachClientCommunications,
  coachMetrics,
  type Coach,
  type InsertCoach,
  type CoachCredential,
  type InsertCoachCredential,
  type CoachBanking,
  type InsertCoachBanking,
  type CoachAvailability,
  type InsertCoachAvailability,
  type CoachClient,
  type InsertCoachClient,
  type CoachSessionNotes,
  type InsertCoachSessionNotes,
  type CoachMessageTemplate,
  type InsertCoachMessageTemplate,
  type CoachClientCommunication,
  type InsertCoachClientCommunication,
  type CoachMetrics,
} from "@shared/coach-schema";

interface CoachSession {
  id: string;
  coachId: string;
  clientId: string;
  token: string;
  expiresAt: Date;
}

export class CoachMemoryStorage {
  private coaches = new Map<number, Coach>();
  private coachCredentials = new Map<number, CoachCredential>();
  private coachBanking = new Map<number, CoachBanking>();
  private coachAvailability = new Map<number, CoachAvailability>();
  private coachClients = new Map<number, CoachClient>();
  private coachSessionNotes = new Map<number, CoachSessionNotes>();
  private coachMessageTemplates = new Map<number, CoachMessageTemplate>();
  private coachClientCommunications = new Map<number, CoachClientCommunication>();
  private coachMetrics = new Map<number, CoachMetrics>();
  private coachSessions = new Map<string, CoachSession>();

  private nextId = {
    coaches: 1,
    credentials: 1,
    banking: 1,
    availability: 1,
    clients: 1,
    sessionNotes: 1,
    templates: 1,
    communications: 1,
    metrics: 1,
  };

  constructor() {
    this.seedCoachData();
  }

  private seedCoachData() {
    // Sample coach data
    const sampleCoach: Coach = {
      id: 1,
      userId: "coach_001",
      coachId: "WWC_001",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@wholewellness.org",
      phone: "+1-555-0123",
      profileImage: null,
      bio: "Licensed clinical social worker specializing in trauma recovery and domestic violence support. 8+ years helping women rebuild their lives.",
      specialties: ["Trauma Recovery", "Domestic Violence", "Financial Planning", "Crisis Intervention"],
      experience: 8,
      status: "active",
      isVerified: true,
      hourlyRate: "125.00",
      timezone: "America/New_York",
      languages: ["English", "Spanish"],
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date(),
    };

    this.coaches.set(1, sampleCoach);

    // Sample credentials
    const sampleCredential: CoachCredential = {
      id: 1,
      coachId: 1,
      credentialType: "license",
      title: "Licensed Clinical Social Worker (LCSW)",
      issuingOrganization: "New York State Board of Social Work",
      issueDate: new Date("2020-03-15"),
      expirationDate: new Date("2025-03-15"),
      credentialNumber: "LCSW-12345",
      documentUrl: "/documents/sarah_lcsw.pdf",
      verificationStatus: "verified",
      createdAt: new Date("2023-01-15"),
    };

    this.coachCredentials.set(1, sampleCredential);

    // Sample availability
    const availabilitySlots = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", sessionType: "individual" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", sessionType: "crisis" },
    ];

    availabilitySlots.forEach((slot, index) => {
      const availability: CoachAvailability = {
        id: index + 1,
        coachId: 1,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: true,
        sessionType: slot.sessionType,
        maxClients: slot.sessionType === "crisis" ? 3 : 1,
        createdAt: new Date(),
      };
      this.coachAvailability.set(index + 1, availability);
    });

    // Sample message templates
    const messageTemplates = [
      {
        templateName: "Session Reminder",
        messageType: "reminder",
        messageContent: "Hi {clientName}, this is a reminder about your coaching session tomorrow at {time}. Reply CONFIRM to confirm or RESCHEDULE if you need to change the time. Looking forward to our conversation! - Coach {coachName}",
      },
      {
        templateName: "Check-in Message",
        messageType: "check-in",
        messageContent: "Hi {clientName}, just checking in to see how you're doing with the goals we discussed. Remember, progress isn't always linear - every small step counts! Feel free to reach out if you need support. - Coach {coachName}",
      },
      {
        templateName: "Crisis Support",
        messageType: "crisis",
        messageContent: "I'm here for you right now. If this is an emergency, please call 911. For crisis support, text HOME to 741741 or call the National Domestic Violence Hotline at 1-800-799-7233. I'll follow up with you as soon as possible.",
      },
      {
        templateName: "Motivation Message",
        messageType: "motivation",
        messageContent: "You are stronger than you know and braver than you feel. Every day you choose to move forward is a victory. I believe in you, {clientName}! - Coach {coachName}",
      },
    ];

    messageTemplates.forEach((template, index) => {
      const messageTemplate: CoachMessageTemplate = {
        id: index + 1,
        coachId: 1,
        templateName: template.templateName,
        messageType: template.messageType,
        messageContent: template.messageContent,
        isActive: true,
        usageCount: Math.floor(Math.random() * 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.coachMessageTemplates.set(index + 1, messageTemplate);
    });

    this.nextId.coaches = 2;
    this.nextId.credentials = 2;
    this.nextId.availability = availabilitySlots.length + 1;
    this.nextId.templates = messageTemplates.length + 1;
  }

  // Coach CRUD operations
  async getCoachByUserId(userId: string): Promise<Coach | undefined> {
    return Array.from(this.coaches.values()).find(coach => coach.userId === userId);
  }

  async getCoachById(id: number): Promise<Coach | undefined> {
    return this.coaches.get(id);
  }

  async getCoachByCoachId(coachId: string): Promise<Coach | undefined> {
    return Array.from(this.coaches.values()).find(coach => coach.coachId === coachId);
  }

  async getAllCoaches(): Promise<Coach[]> {
    return Array.from(this.coaches.values());
  }

  async getActiveCoaches(): Promise<Coach[]> {
    return Array.from(this.coaches.values()).filter(coach => coach.status === "active");
  }

  async createCoach(coachData: InsertCoach & { id?: number }): Promise<Coach> {
    const id = coachData.id || this.nextId.coaches++;
    const coach: Coach = {
      id,
      ...coachData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coaches.set(id, coach);
    return coach;
  }

  async updateCoach(id: number, updates: Partial<Coach>): Promise<Coach | undefined> {
    const coach = this.coaches.get(id);
    if (!coach) return undefined;

    const updatedCoach = {
      ...coach,
      ...updates,
      updatedAt: new Date(),
    };
    this.coaches.set(id, updatedCoach);
    return updatedCoach;
  }

  // Credentials operations
  async getCoachCredentials(coachId: number): Promise<CoachCredential[]> {
    return Array.from(this.coachCredentials.values()).filter(cred => cred.coachId === coachId);
  }

  async createCoachCredential(credentialData: InsertCoachCredential & { id?: number }): Promise<CoachCredential> {
    const id = credentialData.id || this.nextId.credentials++;
    const credential: CoachCredential = {
      id,
      ...credentialData,
      createdAt: new Date(),
    };
    this.coachCredentials.set(id, credential);
    return credential;
  }

  // Banking operations
  async getCoachBanking(coachId: number): Promise<CoachBanking | undefined> {
    return Array.from(this.coachBanking.values()).find(banking => banking.coachId === coachId);
  }

  async createOrUpdateCoachBanking(bankingData: InsertCoachBanking & { id?: number }): Promise<CoachBanking> {
    const existing = await this.getCoachBanking(bankingData.coachId);
    if (existing) {
      const updated = {
        ...existing,
        ...bankingData,
        updatedAt: new Date(),
      };
      this.coachBanking.set(existing.id, updated);
      return updated;
    }

    const id = bankingData.id || this.nextId.banking++;
    const banking: CoachBanking = {
      id,
      ...bankingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coachBanking.set(id, banking);
    return banking;
  }

  // Availability operations
  async getCoachAvailability(coachId: number): Promise<CoachAvailability[]> {
    return Array.from(this.coachAvailability.values()).filter(avail => avail.coachId === coachId);
  }

  async createCoachAvailability(availabilityData: InsertCoachAvailability & { id?: number }): Promise<CoachAvailability> {
    const id = availabilityData.id || this.nextId.availability++;
    const availability: CoachAvailability = {
      id,
      ...availabilityData,
      createdAt: new Date(),
    };
    this.coachAvailability.set(id, availability);
    return availability;
  }

  async updateCoachAvailability(id: number, updates: Partial<CoachAvailability>): Promise<CoachAvailability | undefined> {
    const availability = this.coachAvailability.get(id);
    if (!availability) return undefined;

    const updated = { ...availability, ...updates };
    this.coachAvailability.set(id, updated);
    return updated;
  }

  async deleteCoachAvailability(id: number): Promise<boolean> {
    return this.coachAvailability.delete(id);
  }

  // Client relationship operations
  async getCoachClients(coachId: number): Promise<CoachClient[]> {
    return Array.from(this.coachClients.values()).filter(client => client.coachId === coachId);
  }

  async assignClientToCoach(assignmentData: InsertCoachClient & { id?: number }): Promise<CoachClient> {
    const id = assignmentData.id || this.nextId.clients++;
    const assignment: CoachClient = {
      id,
      ...assignmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coachClients.set(id, assignment);
    return assignment;
  }

  async updateCoachClient(id: number, updates: Partial<CoachClient>): Promise<CoachClient | undefined> {
    const client = this.coachClients.get(id);
    if (!client) return undefined;

    const updated = {
      ...client,
      ...updates,
      updatedAt: new Date(),
    };
    this.coachClients.set(id, updated);
    return updated;
  }

  // Session notes operations
  async getCoachSessionNotes(coachId: number, clientId?: string): Promise<CoachSessionNotes[]> {
    const notes = Array.from(this.coachSessionNotes.values()).filter(note => note.coachId === coachId);
    if (clientId) {
      return notes.filter(note => note.clientId === clientId);
    }
    return notes;
  }

  async createCoachSessionNotes(notesData: InsertCoachSessionNotes & { id?: number }): Promise<CoachSessionNotes> {
    const id = notesData.id || this.nextId.sessionNotes++;
    const notes: CoachSessionNotes = {
      id,
      ...notesData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coachSessionNotes.set(id, notes);
    return notes;
  }

  // Message template operations
  async getCoachMessageTemplates(coachId: number): Promise<CoachMessageTemplate[]> {
    return Array.from(this.coachMessageTemplates.values()).filter(template => template.coachId === coachId);
  }

  async createCoachMessageTemplate(templateData: InsertCoachMessageTemplate & { id?: number }): Promise<CoachMessageTemplate> {
    const id = templateData.id || this.nextId.templates++;
    const template: CoachMessageTemplate = {
      id,
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coachMessageTemplates.set(id, template);
    return template;
  }

  async updateCoachMessageTemplate(id: number, updates: Partial<CoachMessageTemplate>): Promise<CoachMessageTemplate | undefined> {
    const template = this.coachMessageTemplates.get(id);
    if (!template) return undefined;

    const updated = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };
    this.coachMessageTemplates.set(id, updated);
    return updated;
  }

  // Communication log operations
  async getCoachClientCommunications(coachId: number, clientId?: string): Promise<CoachClientCommunication[]> {
    const communications = Array.from(this.coachClientCommunications.values()).filter(comm => comm.coachId === coachId);
    if (clientId) {
      return communications.filter(comm => comm.clientId === clientId);
    }
    return communications;
  }

  async createCoachClientCommunication(commData: InsertCoachClientCommunication & { id?: number }): Promise<CoachClientCommunication> {
    const id = commData.id || this.nextId.communications++;
    const communication: CoachClientCommunication = {
      id,
      ...commData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coachClientCommunications.set(id, communication);
    return communication;
  }

  // Coach metrics operations
  async getCoachMetrics(coachId: number, periodStart?: Date, periodEnd?: Date): Promise<CoachMetrics[]> {
    let metrics = Array.from(this.coachMetrics.values()).filter(metric => metric.coachId === coachId);
    
    if (periodStart && periodEnd) {
      metrics = metrics.filter(metric => 
        metric.periodStart >= periodStart && metric.periodEnd <= periodEnd
      );
    }
    
    return metrics;
  }

  // QuickBooks integration helpers
  async updateQuickBooksVendorId(coachId: number, vendorId: string): Promise<boolean> {
    const banking = await this.getCoachBanking(coachId);
    if (!banking) return false;

    const updated = {
      ...banking,
      quickbooksVendorId: vendorId,
      updatedAt: new Date(),
    };
    this.coachBanking.set(banking.id, updated);
    return true;
  }

  // n8n integration helpers
  async logN8nCommunication(coachId: number, clientId: string, workflowId: string, content: string): Promise<CoachClientCommunication> {
    return this.createCoachClientCommunication({
      coachId,
      clientId,
      communicationType: "sms",
      direction: "outbound",
      content,
      isAutomated: true,
      n8nWorkflowId: workflowId,
      deliveryStatus: "sent",
    });
  }

  // Search and filtering
  async searchCoaches(query: string): Promise<Coach[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.coaches.values()).filter(coach =>
      coach.firstName.toLowerCase().includes(searchTerm) ||
      coach.lastName.toLowerCase().includes(searchTerm) ||
      coach.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm)) ||
      coach.bio?.toLowerCase().includes(searchTerm)
    );
  }

  async getCoachesBySpecialty(specialty: string): Promise<Coach[]> {
    return Array.from(this.coaches.values()).filter(coach =>
      coach.specialties.includes(specialty) && coach.status === "active"
    );
  }
}

export const coachStorage = new CoachMemoryStorage();
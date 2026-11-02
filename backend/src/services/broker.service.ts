import {
  BrokerQueryInput,
  ContactBrokerInput,
  CreateBrokerInput,
  UpdateBrokerProfileInput,
  BrokerSummary,
  BrokerDetail,
  BrokerListResponse,
  Role,
  UserStatus,
  VisitStatus,
} from '@housing-clone/shared';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { EnquiryService } from './enquiry.service';
import { MySqlPropertySearchService } from './search/mysqlPropertySearch.service';
import { PasswordService } from './password.service';
import { AuditService } from './audit.service';

export class BrokerService {
  // Admin creates a broker
  public static async createBrokerByAdmin(input: CreateBrokerInput, adminUserId: string, ipAddress?: string) {
    const existing = await db.user.findFirst({
      where: { OR: [{ email: input.email }, { phone: input.phone }] },
    });
    if (existing) {
      throw new AppError(409, 'User with this email or phone number already exists', 'DUPLICATE_USER');
    }

    const passwordHash = await PasswordService.hashPassword(input.password);
    const role = (input.role as unknown as import('@prisma/client').Role) || 'AGENT';

    const broker = await db.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role,
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (input.agencyName) {
      const devOrg = await db.developerOrganization.create({
        data: {
          companyName: input.agencyName,
          slug: `agency-${broker.id.substring(0, 8)}`,
        },
      });
      await db.developerMember.create({
        data: {
          developerOrganizationId: devOrg.id,
          userId: broker.id,
          memberRole: 'OWNER',
        },
      });
    }

    await AuditService.log(
      adminUserId,
      'BROKER_CREATED',
      'User',
      broker.id,
      { email: broker.email, role: broker.role },
      ipAddress
    );

    return {
      id: broker.id,
      firstName: broker.firstName,
      lastName: broker.lastName,
      email: broker.email,
      phone: broker.phone,
      role: broker.role,
      status: broker.status,
      createdAt: broker.createdAt.toISOString(),
    };
  }

  // Admin gets brokers list
  public static async getBrokersForAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: import('@prisma/client').Prisma.UserWhereInput = {
      role: { in: ['AGENT', 'DEVELOPER'] },
    };

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          postedProperties: { select: { id: true } },
          receivedLeads: { select: { id: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        verified: u.emailVerified || u.phoneVerified,
        propertyCount: u.postedProperties.length,
        leadCount: u.receivedLeads.length,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  // Admin updates broker status
  public static async updateBrokerStatusByAdmin(brokerId: string, status: UserStatus, adminUserId: string, ipAddress?: string) {
    const broker = await db.user.findUnique({ where: { id: brokerId } });
    if (!broker) throw new AppError(404, 'Broker account not found', 'NOT_FOUND');

    const updated = await db.user.update({
      where: { id: brokerId },
      data: { status: status as unknown as import('@prisma/client').UserStatus },
    });

    await AuditService.log(
      adminUserId,
      'BROKER_STATUS_UPDATED',
      'User',
      brokerId,
      { previousStatus: broker.status, newStatus: status },
      ipAddress
    );

    return updated;
  }

  // Admin resets broker password
  public static async resetBrokerPasswordByAdmin(brokerId: string, newPassword: string, adminUserId: string, ipAddress?: string) {
    const broker = await db.user.findUnique({ where: { id: brokerId } });
    if (!broker) throw new AppError(404, 'Broker account not found', 'NOT_FOUND');

    const passwordHash = await PasswordService.hashPassword(newPassword);
    await db.user.update({
      where: { id: brokerId },
      data: { passwordHash },
    });

    await AuditService.log(
      adminUserId,
      'BROKER_PASSWORD_RESET',
      'User',
      brokerId,
      { email: broker.email },
      ipAddress
    );

    return { message: 'Broker password reset successfully' };
  }

  // Public get brokers
  public static async getBrokers(input: BrokerQueryInput): Promise<BrokerListResponse> {
    const page = input.page || 1;
    const limit = input.limit || 12;
    const skip = (page - 1) * limit;

    const allowedRoles = input.role ? [input.role] : [Role.AGENT, Role.OWNER, Role.DEVELOPER];

    const whereClause: import('@prisma/client').Prisma.UserWhereInput = {
      role: { in: allowedRoles as unknown as import('@prisma/client').Role[] },
      status: 'ACTIVE',
    };

    if (input.query) {
      const q = input.query.toLowerCase().trim();
      whereClause.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const total = await db.user.count({ where: whereClause });

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        ownedProperties: {
          where: { listingState: 'ACTIVE' },
          select: {
            id: true,
            listingPurpose: true,
            city: { select: { name: true } },
            locality: { select: { name: true } },
            propertyType: { select: { name: true } },
          },
        },
        postedProperties: {
          where: { listingState: 'ACTIVE' },
          select: {
            id: true,
            listingPurpose: true,
            city: { select: { name: true } },
            locality: { select: { name: true } },
            propertyType: { select: { name: true } },
          },
        },
        assignedProperties: {
          where: { listingState: 'ACTIVE' },
          select: {
            id: true,
            listingPurpose: true,
            city: { select: { name: true } },
            locality: { select: { name: true } },
            propertyType: { select: { name: true } },
          },
        },
        developerMemberships: {
          select: {
            developerOrganization: {
              select: { companyName: true },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: input.order || 'desc' },
    });

    const defaultCityRecord = await db.city.findFirst({ where: { isActive: true } });
    const fallbackCityName = defaultCityRecord?.name || '';
    const fallbackLocalities = defaultCityRecord
      ? (await db.locality.findMany({ where: { cityId: defaultCityRecord.id }, take: 3 })).map((l) => l.name)
      : [];

    const brokers: BrokerSummary[] = users.map((u) => {
      const allActiveProps = [...u.ownedProperties, ...u.postedProperties, ...u.assignedProperties];
      const uniquePropMap = new Map<string, typeof allActiveProps[0]>();
      allActiveProps.forEach((p) => uniquePropMap.set(p.id, p));
      const activeProps = Array.from(uniquePropMap.values());

      const cities = Array.from(new Set(activeProps.map((p) => p.city?.name).filter(Boolean))) as string[];
      const localities = Array.from(new Set(activeProps.map((p) => p.locality?.name).filter(Boolean))) as string[];
      const pTypes = Array.from(new Set(activeProps.map((p) => p.propertyType?.name).filter(Boolean))) as string[];

      const hasBuy = activeProps.some((p) => p.listingPurpose === 'BUY');
      const hasRent = activeProps.some((p) => p.listingPurpose === 'RENT');
      const specialization: 'BUY' | 'RENT' | 'BOTH' = hasBuy && hasRent ? 'BOTH' : hasRent ? 'RENT' : 'BUY';

      const agencyName = u.developerMemberships[0]?.developerOrganization.companyName || null;
      const tenureYears = Math.max(1, new Date().getFullYear() - new Date(u.createdAt).getFullYear() + 2);

      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.emailVerified ? u.email : null,
        phone: u.phoneVerified ? u.phone : null,
        avatarUrl: u.avatarUrl,
        role: u.role as unknown as Role,
        agencyName,
        experienceYears: tenureYears,
        city: cities[0] || fallbackCityName,
        areasServed: localities.length > 0 ? localities : fallbackLocalities,
        propertyTypesServed: pTypes.length > 0 ? pTypes : ['Residential', 'Commercial'],
        specialization,
        verified: u.emailVerified || u.phoneVerified,
        rating: 4.8,
        reviewCount: Math.max(3, activeProps.length * 4 + 2),
        activeListingCount: activeProps.length,
        createdAt: u.createdAt.toISOString(),
      };
    });

    let filteredBrokers = brokers;
    if (input.city) {
      const cityFilter = input.city.toLowerCase();
      filteredBrokers = filteredBrokers.filter((b) => b.city?.toLowerCase().includes(cityFilter));
    }
    if (input.specialization) {
      filteredBrokers = filteredBrokers.filter(
        (b) => b.specialization === input.specialization || b.specialization === 'BOTH'
      );
    }

    const totalPages = Math.ceil(total / limit);

    return {
      brokers: filteredBrokers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  public static async getBrokerById(brokerId: string): Promise<BrokerDetail> {
    const u = await db.user.findUnique({
      where: { id: brokerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        developerMemberships: {
          select: {
            developerOrganization: {
              select: { companyName: true, description: true },
            },
          },
        },
      },
    });

    if (!u) {
      throw new AppError(404, 'Broker profile not found', 'NOT_FOUND');
    }

    const properties = await db.property.findMany({
      where: {
        OR: [{ ownerId: brokerId }, { postedByUserId: brokerId }, { assignedAgentId: brokerId }],
        listingState: 'ACTIVE',
      },
      include: {
        city: true,
        locality: true,
        propertyType: true,
        media: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const activeProperties = properties.map((p) => MySqlPropertySearchService.mapToSearchSummary(p));

    const cities = Array.from(new Set(properties.map((p) => p.city?.name).filter(Boolean))) as string[];
    const localities = Array.from(new Set(properties.map((p) => p.locality?.name).filter(Boolean))) as string[];
    const pTypes = Array.from(new Set(properties.map((p) => p.propertyType?.name).filter(Boolean))) as string[];

    const hasBuy = properties.some((p) => p.listingPurpose === 'BUY');
    const hasRent = properties.some((p) => p.listingPurpose === 'RENT');
    const specialization: 'BUY' | 'RENT' | 'BOTH' = hasBuy && hasRent ? 'BOTH' : hasRent ? 'RENT' : 'BUY';

    const agencyName = u.developerMemberships[0]?.developerOrganization.companyName || null;
    const companyDesc = u.developerMemberships[0]?.developerOrganization.description || null;
    const tenureYears = Math.max(1, new Date().getFullYear() - new Date(u.createdAt).getFullYear() + 2);

    const defaultCityRecord = await db.city.findFirst({ where: { isActive: true } });
    const fallbackCityName = defaultCityRecord?.name || '';
    const fallbackLocalities = defaultCityRecord
      ? (await db.locality.findMany({ where: { cityId: defaultCityRecord.id }, take: 3 })).map((l) => l.name)
      : [];

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.emailVerified ? u.email : null,
      phone: u.phoneVerified ? u.phone : null,
      avatarUrl: u.avatarUrl,
      role: u.role as unknown as Role,
      agencyName,
      experienceYears: tenureYears,
      city: cities[0] || fallbackCityName,
      areasServed: localities.length > 0 ? localities : fallbackLocalities,
      propertyTypesServed: pTypes.length > 0 ? pTypes : ['Residential', 'Commercial'],
      specialization,
      verified: u.emailVerified || u.phoneVerified,
      rating: 4.8,
      reviewCount: Math.max(3, activeProperties.length * 4 + 2),
      activeListingCount: activeProperties.length,
      createdAt: u.createdAt.toISOString(),
      about:
        companyDesc ||
        `${u.firstName} ${u.lastName} is a verified real estate ${
          u.role === 'AGENT' ? 'agent' : u.role === 'DEVELOPER' ? 'developer representative' : 'property advisor'
        } with over ${tenureYears} years of experience in ${cities[0] || fallbackCityName}. Specializing in residential and commercial property transactions.`,
      activeProperties,
    };
  }

  // Broker Dashboard Metrics
  public static async getBrokerDashboardMetrics(brokerUserId: string) {
    const whereProp: import('@prisma/client').Prisma.PropertyWhereInput = {
      OR: [{ ownerId: brokerUserId }, { postedByUserId: brokerUserId }, { assignedAgentId: brokerUserId }],
    };

    const [totalProperties, activeProperties, pendingProperties, rejectedProperties, leads, visits] = await Promise.all([
      db.property.count({ where: whereProp }),
      db.property.count({ where: { ...whereProp, listingState: 'ACTIVE' } }),
      db.property.count({ where: { ...whereProp, listingState: 'PENDING_APPROVAL' } }),
      db.property.count({ where: { ...whereProp, listingState: 'REJECTED' } }),
      db.lead.findMany({
        where: { OR: [{ sellerId: brokerUserId }, { assignedAgentId: brokerUserId }] },
        include: { enquiry: true, property: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.propertyVisit.findMany({
        where: { OR: [{ assignedUserId: brokerUserId }, { property: { ownerId: brokerUserId } }] },
        include: { property: true, requester: { select: { firstName: true, lastName: true, email: true, phone: true } } },
        orderBy: { scheduledDate: 'asc' },
      }),
    ]);

    const upcomingVisits = visits.filter((v) => v.status === 'SCHEDULED');
    const completedVisits = visits.filter((v) => v.status === 'COMPLETED');

    return {
      metrics: {
        totalProperties,
        activeProperties,
        pendingProperties,
        rejectedProperties,
        totalLeads: leads.length,
        newLeads: leads.filter((l) => l.status === 'NEW').length,
        totalVisits: visits.length,
        upcomingVisitsCount: upcomingVisits.length,
        completedVisitsCount: completedVisits.length,
      },
      recentLeads: leads.slice(0, 5),
      upcomingVisits: upcomingVisits.slice(0, 5),
    };
  }

  // Broker Properties (Strict Ownership Check)
  public static async getBrokerProperties(brokerUserId: string) {
    return db.property.findMany({
      where: {
        OR: [{ ownerId: brokerUserId }, { postedByUserId: brokerUserId }, { assignedAgentId: brokerUserId }],
      },
      include: {
        city: true,
        locality: true,
        propertyType: true,
        media: { take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Broker Leads (Strict Ownership Check)
  public static async getBrokerLeads(brokerUserId: string) {
    return db.lead.findMany({
      where: {
        OR: [{ sellerId: brokerUserId }, { assignedAgentId: brokerUserId }],
      },
      include: {
        enquiry: true,
        property: true,
        assignedAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Assign lead to team sub-agent
  public static async assignLeadToSubAgent(brokerUserId: string, leadId: string, targetAgentId: string) {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { property: true },
    });

    if (!lead) throw new AppError(404, 'Lead not found', 'NOT_FOUND');

    const isAuthorized =
      lead.sellerId === brokerUserId ||
      lead.assignedAgentId === brokerUserId ||
      lead.property.ownerId === brokerUserId ||
      lead.property.postedByUserId === brokerUserId;

    if (!isAuthorized) {
      throw new AppError(403, 'Unauthorized access to lead record', 'FORBIDDEN');
    }

    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: { assignedAgentId: targetAgentId, status: 'CONTACTED' },
      include: { assignedAgent: { select: { id: true, firstName: true, lastName: true } } },
    });

    return updatedLead;
  }

  // Update lead status & notes
  public static async updateLeadStatusByBroker(
    brokerUserId: string,
    leadId: string,
    status: string,
    notes?: string
  ) {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { property: true },
    });

    if (!lead) throw new AppError(404, 'Lead not found', 'NOT_FOUND');

    const isAuthorized =
      lead.sellerId === brokerUserId ||
      lead.assignedAgentId === brokerUserId ||
      lead.property.ownerId === brokerUserId ||
      lead.property.postedByUserId === brokerUserId;

    if (!isAuthorized) {
      throw new AppError(403, 'Unauthorized access to lead record', 'FORBIDDEN');
    }

    return db.lead.update({
      where: { id: leadId },
      data: {
        status: status as unknown as import('@prisma/client').LeadStatus,
        notes: notes !== undefined ? notes : lead.notes,
      },
    });
  }

  // Team Management: Get Agency Sub-Agents
  public static async getBrokerTeam(brokerUserId: string) {
    // Find agency organization owned/managed by broker
    const membership = await db.developerMember.findFirst({
      where: { userId: brokerUserId },
      include: {
        developerOrganization: {
          include: {
            members: {
              include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, status: true, createdAt: true } } },
            },
          },
        },
      },
    });

    if (!membership) {
      return [];
    }

    return membership.developerOrganization.members.map((m) => ({
      memberId: m.id,
      memberRole: m.memberRole,
      user: m.user,
    }));
  }

  // Team Management: Add Sub-Agent
  public static async addSubAgentByBroker(brokerUserId: string, input: { firstName: string; lastName: string; email: string; phone: string; password: string }) {
    const membership = await db.developerMember.findFirst({
      where: { userId: brokerUserId },
      include: { developerOrganization: true },
    });

    let devOrgId = membership?.developerOrganizationId;
    if (!devOrgId) {
      const devOrg = await db.developerOrganization.create({
        data: {
          companyName: `Agency of ${brokerUserId.substring(0, 8)}`,
          slug: `agency-org-${brokerUserId.substring(0, 8)}`,
        },
      });
      devOrgId = devOrg.id;
      await db.developerMember.create({
        data: { developerOrganizationId: devOrgId, userId: brokerUserId, memberRole: 'OWNER' },
      });
    }

    const passwordHash = await PasswordService.hashPassword(input.password);
    const subAgent = await db.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: 'AGENT',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    await db.developerMember.create({
      data: {
        developerOrganizationId: devOrgId,
        userId: subAgent.id,
        memberRole: 'AGENT',
      },
    });

    return {
      id: subAgent.id,
      firstName: subAgent.firstName,
      lastName: subAgent.lastName,
      email: subAgent.email,
      phone: subAgent.phone,
      role: subAgent.role,
    };
  }

  // Broker Enquiries (Strict Ownership Check)
  public static async getBrokerEnquiries(brokerUserId: string) {
    return db.enquiry.findMany({
      where: {
        property: {
          OR: [{ ownerId: brokerUserId }, { postedByUserId: brokerUserId }, { assignedAgentId: brokerUserId }],
        },
      },
      include: {
        property: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Broker Visits (Strict Ownership Check)
  public static async getBrokerVisits(brokerUserId: string) {
    return db.propertyVisit.findMany({
      where: {
        OR: [{ assignedUserId: brokerUserId }, { property: { ownerId: brokerUserId } }],
      },
      include: {
        property: true,
        requester: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  // Update Broker Visit Status
  public static async updateBrokerVisitStatus(brokerUserId: string, visitId: string, status: VisitStatus) {
    const visit = await db.propertyVisit.findUnique({
      where: { id: visitId },
      include: { property: true },
    });

    if (!visit) throw new AppError(404, 'Visit request not found', 'NOT_FOUND');

    const isAuthorized =
      visit.assignedUserId === brokerUserId ||
      visit.property.ownerId === brokerUserId ||
      visit.property.postedByUserId === brokerUserId ||
      visit.property.assignedAgentId === brokerUserId;

    if (!isAuthorized) {
      throw new AppError(403, 'Unauthorized access to visit record', 'FORBIDDEN');
    }

    return db.propertyVisit.update({
      where: { id: visitId },
      data: { status: status as unknown as import('@prisma/client').VisitStatus },
    });
  }

  // Broker Profile
  public static async getBrokerProfile(brokerUserId: string) {
    return db.user.findUnique({
      where: { id: brokerUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        developerMemberships: {
          select: {
            developerOrganization: { select: { id: true, companyName: true, description: true } },
          },
        },
      },
    });
  }

  // Update Broker Profile
  public static async updateBrokerProfile(brokerUserId: string, input: UpdateBrokerProfileInput) {
    const broker = await db.user.findUnique({ where: { id: brokerUserId } });
    if (!broker) throw new AppError(404, 'Broker account not found', 'NOT_FOUND');

    return db.user.update({
      where: { id: brokerUserId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });
  }

  public static async contactBroker(
    userId: string,
    brokerId: string,
    input: ContactBrokerInput,
    ipAddress?: string
  ) {
    const broker = await db.user.findUnique({ where: { id: brokerId } });
    if (!broker) {
      throw new AppError(404, 'Broker not found', 'NOT_FOUND');
    }

    let propertyId = input.propertyId;
    if (!propertyId) {
      const prop = await db.property.findFirst({
        where: {
          OR: [{ ownerId: brokerId }, { postedByUserId: brokerId }, { assignedAgentId: brokerId }],
          listingState: 'ACTIVE',
        },
      });
      if (!prop) {
        throw new AppError(400, 'Broker currently has no active property listing for direct enquiry', 'NO_ACTIVE_LISTING');
      }
      propertyId = prop.id;
    }

    return EnquiryService.createEnquiry(
      userId,
      {
        propertyId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        source: 'BROKER_DIRECTORY',
      },
      ipAddress
    );
  }
}

/* eslint-disable no-console */
import { PrismaClient, Role, PropertyCategory, ListingPurpose, AreaUnit, Furnishing, Facing, PropertyAge, PossessionStatus, VerificationState, ListingState } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash development password ("DevPassword123!")
  const passwordHash = await bcrypt.hash('DevPassword123!', 10);

  // 1. Seed Roles / Development Users
  console.log('👤 Seeding Users...');
  const users = [
    { email: 'buyer@example.test', phone: '+919876543210', firstName: 'Rahul', lastName: 'Sharma', role: Role.TENANT_BUYER },
    { email: 'owner@example.test', phone: '+919876543211', firstName: 'Anita', lastName: 'Deshmukh', role: Role.OWNER },
    { email: 'agent@example.test', phone: '+919876543212', firstName: 'Vikram', lastName: 'Mehta', role: Role.AGENT },
    { email: 'developer@example.test', phone: '+919876543213', firstName: 'Sanjay', lastName: 'Kulkarni', role: Role.DEVELOPER },
    { email: 'moderator@example.test', phone: '+919876543214', firstName: 'Priya', lastName: 'Nair', role: Role.MODERATOR },
    { email: 'admin@example.test', phone: '+919876543215', firstName: 'Admin', lastName: 'User', role: Role.ADMIN },
    { email: 'superadmin@example.test', phone: '+919876543216', firstName: 'Super', lastName: 'Admin', role: Role.SUPER_ADMIN },
    { email: 'housing.com', phone: '+919876543217', firstName: 'Housing', lastName: 'SuperAdmin', role: Role.SUPER_ADMIN, customPassword: 'housing@123' },
  ];

  const userRecords: Record<string, string> = {};
  for (const u of users) {
    const userPassHash = u.customPassword ? await bcrypt.hash(u.customPassword, 10) : passwordHash;
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, passwordHash: userPassHash },
      create: {
        email: u.email,
        phone: u.phone,
        passwordHash: userPassHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        emailVerified: true,
        phoneVerified: true,
      },
    });
    userRecords[u.email] = user.id;
  }

  // 2. Seed States & Cities
  console.log('🗺️ Seeding Location Hierarchy (States & Cities)...');
  const states = [
    { name: 'Maharashtra', code: 'MH' },
    { name: 'Karnataka', code: 'KA' },
    { name: 'Delhi NCR', code: 'DL' },
    { name: 'Telangana', code: 'TS' },
    { name: 'Tamil Nadu', code: 'TN' },
    { name: 'Gujarat', code: 'GJ' },
    { name: 'West Bengal', code: 'WB' },
    { name: 'Rajasthan', code: 'RJ' },
    { name: 'Uttar Pradesh', code: 'UP' },
  ];

  const stateRecords: Record<string, string> = {};
  for (const s of states) {
    const st = await prisma.state.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
    stateRecords[s.code] = st.id;
  }

  const cities = [
    { name: 'Mumbai', slug: 'mumbai', stateCode: 'MH', lat: 19.076, lng: 72.8777, isPopular: true },
    { name: 'Pune', slug: 'pune', stateCode: 'MH', lat: 18.5204, lng: 73.8567, isPopular: true },
    { name: 'Navi Mumbai', slug: 'navi-mumbai', stateCode: 'MH', lat: 19.033, lng: 73.0297, isPopular: true },
    { name: 'Thane', slug: 'thane', stateCode: 'MH', lat: 19.2183, lng: 72.9781, isPopular: true },
    { name: 'Bengaluru', slug: 'bengaluru', stateCode: 'KA', lat: 12.9716, lng: 77.5946, isPopular: true },
    { name: 'Delhi', slug: 'delhi', stateCode: 'DL', lat: 28.7041, lng: 77.1025, isPopular: true },
    { name: 'Gurugram', slug: 'gurugram', stateCode: 'DL', lat: 28.4595, lng: 77.0266, isPopular: true },
    { name: 'Noida', slug: 'noida', stateCode: 'UP', lat: 28.5355, lng: 77.391, isPopular: true },
    { name: 'Hyderabad', slug: 'hyderabad', stateCode: 'TS', lat: 17.385, lng: 78.4867, isPopular: true },
    { name: 'Chennai', slug: 'chennai', stateCode: 'TN', lat: 13.0827, lng: 80.2707, isPopular: true },
    { name: 'Ahmedabad', slug: 'ahmedabad', stateCode: 'GJ', lat: 23.0225, lng: 72.5714, isPopular: true },
    { name: 'Kolkata', slug: 'kolkata', stateCode: 'WB', lat: 22.5726, lng: 88.3639, isPopular: true },
    { name: 'Jaipur', slug: 'jaipur', stateCode: 'RJ', lat: 26.9124, lng: 75.7873, isPopular: true },
  ];

  const cityRecords: Record<string, string> = {};
  for (const c of cities) {
    const city = await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        stateId: stateRecords[c.stateCode],
        latitude: c.lat,
        longitude: c.lng,
        isPopular: c.isPopular,
      },
    });
    cityRecords[c.slug] = city.id;
  }

  // 3. Seed Localities & Sublocalities (Database-Driven Mumbai Locations)
  console.log('📍 Seeding Comprehensive Mumbai Localities...');
  const localities = [
    // Mumbai Localities
    { citySlug: 'mumbai', name: 'Andheri', slug: 'andheri', pincode: '400053', lat: 19.1197, lng: 72.8464 },
    { citySlug: 'mumbai', name: 'Andheri East', slug: 'andheri-east', pincode: '400069', lat: 19.1136, lng: 72.8697 },
    { citySlug: 'mumbai', name: 'Andheri West', slug: 'andheri-west', pincode: '400058', lat: 19.1363, lng: 72.8277 },
    { citySlug: 'mumbai', name: 'Bandra', slug: 'bandra', pincode: '400050', lat: 19.0596, lng: 72.8295 },
    { citySlug: 'mumbai', name: 'Bandra East', slug: 'bandra-east', pincode: '400051', lat: 19.0607, lng: 72.8516 },
    { citySlug: 'mumbai', name: 'Bandra West', slug: 'bandra-west', pincode: '400050', lat: 19.0596, lng: 72.8295 },
    { citySlug: 'mumbai', name: 'Bandra Kurla Complex', slug: 'bandra-kurla-complex', pincode: '400051', lat: 19.0668, lng: 72.8682 },
    { citySlug: 'mumbai', name: 'Borivali', slug: 'borivali', pincode: '400092', lat: 19.2307, lng: 72.8567 },
    { citySlug: 'mumbai', name: 'Borivali East', slug: 'borivali-east', pincode: '400066', lat: 19.2294, lng: 72.8631 },
    { citySlug: 'mumbai', name: 'Borivali West', slug: 'borivali-west', pincode: '400092', lat: 19.2307, lng: 72.8567 },
    { citySlug: 'mumbai', name: 'Dadar', slug: 'dadar', pincode: '400028', lat: 19.0178, lng: 72.8478 },
    { citySlug: 'mumbai', name: 'Dadar East', slug: 'dadar-east', pincode: '400014', lat: 19.0178, lng: 72.8478 },
    { citySlug: 'mumbai', name: 'Dadar West', slug: 'dadar-west', pincode: '400028', lat: 19.0188, lng: 72.8398 },
    { citySlug: 'mumbai', name: 'Goregaon', slug: 'goregaon', pincode: '400062', lat: 19.1663, lng: 72.8526 },
    { citySlug: 'mumbai', name: 'Goregaon East', slug: 'goregaon-east', pincode: '400063', lat: 19.1633, lng: 72.8601 },
    { citySlug: 'mumbai', name: 'Goregaon West', slug: 'goregaon-west', pincode: '400104', lat: 19.1627, lng: 72.8427 },
    { citySlug: 'mumbai', name: 'Malad', slug: 'malad', pincode: '400064', lat: 19.1872, lng: 72.8484 },
    { citySlug: 'mumbai', name: 'Malad East', slug: 'malad-east', pincode: '400097', lat: 19.1833, lng: 72.8583 },
    { citySlug: 'mumbai', name: 'Malad West', slug: 'malad-west', pincode: '400064', lat: 19.186, lng: 72.8353 },
    { citySlug: 'mumbai', name: 'Kandivali', slug: 'kandivali', pincode: '400067', lat: 19.2065, lng: 72.8532 },
    { citySlug: 'mumbai', name: 'Kandivali East', slug: 'kandivali-east', pincode: '400101', lat: 19.2081, lng: 72.8621 },
    { citySlug: 'mumbai', name: 'Kandivali West', slug: 'kandivali-west', pincode: '400067', lat: 19.2043, lng: 72.8364 },
    { citySlug: 'mumbai', name: 'Powai', slug: 'powai', pincode: '400076', lat: 19.1176, lng: 72.906 },
    { citySlug: 'mumbai', name: 'Juhu', slug: 'juhu', pincode: '400049', lat: 19.1075, lng: 72.8263 },
    { citySlug: 'mumbai', name: 'Ghatkopar', slug: 'ghatkopar', pincode: '400086', lat: 19.086, lng: 72.908 },
    { citySlug: 'mumbai', name: 'Ghatkopar East', slug: 'ghatkopar-east', pincode: '400077', lat: 19.0818, lng: 72.912 },
    { citySlug: 'mumbai', name: 'Ghatkopar West', slug: 'ghatkopar-west', pincode: '400086', lat: 19.0883, lng: 72.904 },
    { citySlug: 'mumbai', name: 'Kurla', slug: 'kurla', pincode: '400070', lat: 19.0726, lng: 72.8845 },
    { citySlug: 'mumbai', name: 'Kurla East', slug: 'kurla-east', pincode: '400024', lat: 19.0623, lng: 72.8943 },
    { citySlug: 'mumbai', name: 'Kurla West', slug: 'kurla-west', pincode: '400070', lat: 19.0726, lng: 72.8845 },
    { citySlug: 'mumbai', name: 'Vile Parle', slug: 'vile-parle', pincode: '400057', lat: 19.0968, lng: 72.8517 },
    { citySlug: 'mumbai', name: 'Vile Parle East', slug: 'vile-parle-east', pincode: '400057', lat: 19.0968, lng: 72.8517 },
    { citySlug: 'mumbai', name: 'Vile Parle West', slug: 'vile-parle-west', pincode: '400056', lat: 19.1023, lng: 72.8385 },
    { citySlug: 'mumbai', name: 'Chembur', slug: 'chembur', pincode: '400071', lat: 19.0622, lng: 72.8973 },
    { citySlug: 'mumbai', name: 'Mulund', slug: 'mulund', pincode: '400080', lat: 19.1726, lng: 72.9565 },
    { citySlug: 'mumbai', name: 'Wadala', slug: 'wadala', pincode: '400031', lat: 19.0182, lng: 72.8587 },
    { citySlug: 'mumbai', name: 'Worli', slug: 'worli', pincode: '400018', lat: 19.0166, lng: 72.8168 },
    { citySlug: 'mumbai', name: 'Lower Parel', slug: 'lower-parel', pincode: '400013', lat: 18.9953, lng: 72.831 },
    { citySlug: 'mumbai', name: 'Parel', slug: 'parel', pincode: '400012', lat: 18.9984, lng: 72.8428 },
    { citySlug: 'mumbai', name: 'Colaba', slug: 'colaba', pincode: '400005', lat: 18.9067, lng: 72.8147 },
    { citySlug: 'mumbai', name: 'Fort', slug: 'fort', pincode: '400001', lat: 18.9322, lng: 72.8339 },

    // Pune Localities
    { citySlug: 'pune', name: 'Hinjewadi', slug: 'hinjewadi', pincode: '411057', lat: 18.5912, lng: 73.7389 },
    { citySlug: 'pune', name: 'Baner', slug: 'baner', pincode: '411045', lat: 18.559, lng: 73.7868 },
    { citySlug: 'pune', name: 'Kharadi', slug: 'kharadi', pincode: '411014', lat: 18.5515, lng: 73.9348 },

    // Bengaluru Localities
    { citySlug: 'bengaluru', name: 'Indiranagar', slug: 'indiranagar', pincode: '560038', lat: 12.9784, lng: 77.6408 },
    { citySlug: 'bengaluru', name: 'Whitefield', slug: 'whitefield', pincode: '560066', lat: 12.9698, lng: 77.7499 },

  ];

  const localityRecords: Record<string, string> = {};
  for (const loc of localities) {
    const l = await prisma.locality.upsert({
      where: { cityId_slug: { cityId: cityRecords[loc.citySlug], slug: loc.slug } },
      update: {},
      create: {
        cityId: cityRecords[loc.citySlug],
        name: loc.name,
        slug: loc.slug,
        pincode: loc.pincode,
        latitude: loc.lat,
        longitude: loc.lng,
      },
    });
    localityRecords[`${loc.citySlug}_${loc.slug}`] = l.id;
  }

  // 3b. Seed SubLocalities
  console.log('📍 Seeding Mumbai SubLocalities...');
  const subLocalities = [
    // Powai Sublocalities
    { localityKey: 'mumbai_powai', name: 'Hiranandani Gardens', slug: 'hiranandani-gardens', lat: 19.1186, lng: 72.9103 },
    { localityKey: 'mumbai_powai', name: 'Chandivali', slug: 'chandivali', lat: 19.1121, lng: 72.8942 },
    { localityKey: 'mumbai_powai', name: 'Powai Lake Area', slug: 'powai-lake-area', lat: 19.1250, lng: 72.9050 },

    // Andheri West Sublocalities
    { localityKey: 'mumbai_andheri-west', name: 'Lokhandwala Complex', slug: 'lokhandwala-complex', lat: 19.1418, lng: 72.8242 },
    { localityKey: 'mumbai_andheri-west', name: 'Seven Bungalows', slug: 'seven-bungalows', lat: 19.1311, lng: 72.8172 },
    { localityKey: 'mumbai_andheri-west', name: 'Versova', slug: 'versova', lat: 19.1351, lng: 72.8146 },

    // Andheri East Sublocalities
    { localityKey: 'mumbai_andheri-east', name: 'JB Nagar', slug: 'jb-nagar', lat: 19.1105, lng: 72.8681 },
    { localityKey: 'mumbai_andheri-east', name: 'Marol', slug: 'marol', lat: 19.1182, lng: 72.8825 },
    { localityKey: 'mumbai_andheri-east', name: 'Chakala', slug: 'chakala', lat: 19.1118, lng: 72.8601 },

    // Bandra West Sublocalities
    { localityKey: 'mumbai_bandra-west', name: 'Pali Hill', slug: 'pali-hill', lat: 19.0628, lng: 72.8285 },
    { localityKey: 'mumbai_bandra-west', name: 'Bandstand', slug: 'bandstand', lat: 19.0450, lng: 72.8192 },
    { localityKey: 'mumbai_bandra-west', name: 'Carter Road', slug: 'carter-road', lat: 19.0667, lng: 72.8222 },

    // Borivali West Sublocalities
    { localityKey: 'mumbai_borivali-west', name: 'IC Colony', slug: 'ic-colony', lat: 19.2458, lng: 72.8488 },
    { localityKey: 'mumbai_borivali-west', name: 'Shimpoli', slug: 'shimpoli', lat: 19.2312, lng: 72.8450 },

    // Dadar West Sublocalities
    { localityKey: 'mumbai_dadar-west', name: 'Shivaji Park', slug: 'shivaji-park', lat: 19.0269, lng: 72.8381 },
    { localityKey: 'mumbai_dadar-west', name: 'Ranade Road', slug: 'ranade-road', lat: 19.0205, lng: 72.8402 },

    // Lower Parel Sublocalities
    { localityKey: 'mumbai_lower-parel', name: 'Phoenix Mills Area', slug: 'phoenix-mills-area', lat: 18.9942, lng: 72.8256 },
    { localityKey: 'mumbai_lower-parel', name: 'Curry Road', slug: 'curry-road', lat: 18.9928, lng: 72.8335 },

    // Worli Sublocalities
    { localityKey: 'mumbai_worli', name: 'Worli Sea Face', slug: 'worli-sea-face', lat: 19.0118, lng: 72.8130 },
    { localityKey: 'mumbai_worli', name: 'Century Mills', slug: 'century-mills', lat: 19.0195, lng: 72.8220 },
  ];

  for (const sub of subLocalities) {
    const localityId = localityRecords[sub.localityKey];
    if (localityId) {
      await prisma.subLocality.upsert({
        where: { localityId_slug: { localityId, slug: sub.slug } },
        update: {},
        create: {
          localityId,
          name: sub.name,
          slug: sub.slug,
          latitude: sub.lat,
          longitude: sub.lng,
        },
      });
    }
  }

  // 4. Seed Property Types
  console.log('🏢 Seeding Property Types...');
  const propertyTypes = [
    { name: 'Apartment', category: PropertyCategory.RESIDENTIAL, slug: 'apartment', icon: 'building' },
    { name: 'Independent House', category: PropertyCategory.RESIDENTIAL, slug: 'independent-house', icon: 'home' },
    { name: 'Villa', category: PropertyCategory.RESIDENTIAL, slug: 'villa', icon: 'castle' },
    { name: 'Plot', category: PropertyCategory.RESIDENTIAL, slug: 'plot', icon: 'map' },
    { name: 'Office Space', category: PropertyCategory.COMMERCIAL, slug: 'office-space', icon: 'briefcase' },
    { name: 'Shop', category: PropertyCategory.COMMERCIAL, slug: 'shop', icon: 'shopping-bag' },
    { name: 'Warehouse', category: PropertyCategory.INDUSTRIAL, slug: 'warehouse', icon: 'warehouse' },
    { name: 'PG / Co-Living', category: PropertyCategory.RESIDENTIAL, slug: 'pg-coliving', icon: 'bed' },
    { name: 'Studio Apartment', category: PropertyCategory.RESIDENTIAL, slug: 'studio-apartment', icon: 'layout' },
  ];

  const typeRecords: Record<string, string> = {};
  for (const pt of propertyTypes) {
    const res = await prisma.propertyType.upsert({
      where: { slug: pt.slug },
      update: {},
      create: pt,
    });
    typeRecords[pt.slug] = res.id;
  }

  // 5. Seed Amenities
  console.log('🏊 Seeding Amenities...');
  const amenities = [
    { name: 'Lift', category: 'BASIC', slug: 'lift', icon: 'arrow-up-down' },
    { name: 'Covered Parking', category: 'BASIC', slug: 'covered-parking', icon: 'car' },
    { name: '24/7 Security', category: 'SAFETY', slug: 'security-24-7', icon: 'shield-check' },
    { name: 'Power Backup', category: 'BASIC', slug: 'power-backup', icon: 'zap' },
    { name: 'Gymnasium', category: 'LIFESTYLE', slug: 'gymnasium', icon: 'dumbbell' },
    { name: 'Swimming Pool', category: 'LIFESTYLE', slug: 'swimming-pool', icon: 'waves' },
    { name: 'Clubhouse', category: 'LIFESTYLE', slug: 'clubhouse', icon: 'users' },
    { name: 'Children Play Area', category: 'LIFESTYLE', slug: 'children-play-area', icon: 'smile' },
    { name: 'Landscaped Garden', category: 'LIFESTYLE', slug: 'landscaped-garden', icon: 'trees' },
    { name: 'CCTV Surveillance', category: 'SAFETY', slug: 'cctv', icon: 'video' },
    { name: 'Intercom', category: 'SAFETY', slug: 'intercom', icon: 'phone' },
    { name: 'Visitor Parking', category: 'CONVENIENCE', slug: 'visitor-parking', icon: 'parking' },
  ];

  const amenityRecords: Record<string, string> = {};
  for (const a of amenities) {
    const res = await prisma.amenity.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
    amenityRecords[a.slug] = res.id;
  }

  // 6. Seed Developer Organization & Project
  console.log('🏗️ Seeding Developer Organization & Projects...');
  const developerOrg = await prisma.developerOrganization.upsert({
    where: { slug: 'apex-realty' },
    update: {},
    create: {
      companyName: 'Apex Realty Developers',
      slug: 'apex-realty',
      description: 'Leading residential developer in Mumbai offering luxury and affordable housing projects.',
      website: 'https://apexrealty.example.test',
      establishedYear: 2008,
      verificationStatus: VerificationState.VERIFIED,
    },
  });

  await prisma.developerMember.upsert({
    where: { developerOrganizationId_userId: { developerOrganizationId: developerOrg.id, userId: userRecords['developer@example.test'] } },
    update: {},
    create: {
      developerOrganizationId: developerOrg.id,
      userId: userRecords['developer@example.test'],
      memberRole: 'OWNER',
    },
  });

  const project = await prisma.project.upsert({
    where: { slug: 'apex-horizon-heights' },
    update: {},
    create: {
      developerOrganizationId: developerOrg.id,
      name: 'Apex Horizon Heights',
      slug: 'apex-horizon-heights',
      description: 'Modern high-rise residential towers in Powai offering 2 & 3 BHK luxury apartments.',
      cityId: cityRecords['mumbai'],
      localityId: localityRecords['mumbai_powai'],
      address: 'Central Avenue, Hiranandani Gardens, Powai, Mumbai',
      latitude: 19.1176,
      longitude: 72.906,
      minPrice: 18500000.0,
      maxPrice: 32000000.0,
      possessionDate: new Date('2025-12-31'),
      constructionStatus: PossessionStatus.UNDER_CONSTRUCTION,
      reraId: 'P51800099988',
      status: ListingState.ACTIVE,
    },
  });

  // 7. Seed Packages, Feature Flags, CMS, Settings
  console.log('💳 Seeding Packages & System Settings...');
  await prisma.package.upsert({
    where: { id: 'pkg-basic-owner' },
    update: {},
    create: {
      id: 'pkg-basic-owner',
      name: 'Basic Owner Plan',
      targetRole: Role.OWNER,
      price: 0,
      validityDays: 30,
      maxListings: 1,
      featuredListingsCount: 0,
    },
  });

  await prisma.package.upsert({
    where: { id: 'pkg-pro-agent' },
    update: {},
    create: {
      id: 'pkg-pro-agent',
      name: 'Pro Agent Subscription',
      targetRole: Role.AGENT,
      price: 2999.0,
      validityDays: 90,
      maxListings: 15,
      featuredListingsCount: 3,
    },
  });

  await prisma.featureFlag.upsert({
    where: { key: 'enable_map_search' },
    update: {},
    create: { key: 'enable_map_search', description: 'Enable spatial bounding-box map search', isEnabled: true },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'marketplace_name' },
    update: { value: 'Housing Clone' },
    create: { key: 'marketplace_name', value: 'Housing Clone' },
  });

  await prisma.cMSContent.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      slug: 'about-us',
      title: 'About Housing Clone',
      content: 'Full-scale real-estate marketplace platform built for buyers, renters, owners, agents, and developers.',
      metaTitle: 'About Us | Housing Clone',
      metaDesc: 'Discover your dream home with Housing Clone real estate portal.',
    },
  });

  // 8. Seed Fictional Development Properties
  console.log('🏡 Seeding Fictional Properties...');
  const prop1 = await prisma.property.upsert({
    where: { slug: 'luxurious-3bhk-apartment-powai-mumbai' },
    update: {},
    create: {
      title: 'Luxurious 3 BHK Apartment with Lake View',
      slug: 'luxurious-3bhk-apartment-powai-mumbai',
      description: 'Spacious 3 BHK apartment in Powai with panoramic lake views, modular kitchen, and modern amenities.',
      listingPurpose: ListingPurpose.BUY,
      propertyCategory: PropertyCategory.RESIDENTIAL,
      propertyTypeId: typeRecords['apartment'],
      projectId: project.id,
      developerOrganizationId: developerOrg.id,
      ownerId: userRecords['developer@example.test'],
      postedByUserId: userRecords['developer@example.test'],
      postedByRole: Role.DEVELOPER,
      bhk: 3,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      carpetArea: 1250.0,
      builtUpArea: 1500.0,
      areaUnit: AreaUnit.SQFT,
      price: 24500000.0,
      furnishing: Furnishing.SEMI_FURNISHED,
      floorNumber: 14,
      totalFloors: 22,
      parkingSpaces: 2,
      facing: Facing.EAST,
      propertyAge: PropertyAge.NEW_CONSTRUCTION,
      possessionStatus: PossessionStatus.UNDER_CONSTRUCTION,
      address: 'Tower A, Apex Horizon Heights, Powai',
      cityId: cityRecords['mumbai'],
      localityId: localityRecords['mumbai_powai'],
      landmark: 'Near IIT Bombay Main Gate',
      pincode: '400076',
      latitude: 19.1176,
      longitude: 72.906,
      verificationState: VerificationState.VERIFIED,
      listingState: ListingState.ACTIVE,
      isFeatured: true,
      isPremium: true,
    },
  });

  // Attach amenities & images
  await prisma.propertyAmenity.upsert({
    where: { propertyId_amenityId: { propertyId: prop1.id, amenityId: amenityRecords['lift'] } },
    update: {},
    create: { propertyId: prop1.id, amenityId: amenityRecords['lift'] },
  });
  await prisma.propertyAmenity.upsert({
    where: { propertyId_amenityId: { propertyId: prop1.id, amenityId: amenityRecords['swimming-pool'] } },
    update: {},
    create: { propertyId: prop1.id, amenityId: amenityRecords['swimming-pool'] },
  });

  await prisma.propertyMedia.createMany({
    data: [
      {
        propertyId: prop1.id,
        mediaType: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
        caption: 'Spacious Living Room',
        displayOrder: 1,
      },
      {
        propertyId: prop1.id,
        mediaType: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
        caption: 'Master Bedroom',
        displayOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  const prop2 = await prisma.property.upsert({
    where: { slug: 'modern-2bhk-flat-for-rent-in-baner-pune' },
    update: {},
    create: {
      title: 'Modern 2 BHK Fully Furnished Flat for Rent',
      slug: 'modern-2bhk-flat-for-rent-in-baner-pune',
      description: 'Fully furnished 2 BHK apartment for rent in Baner, ideal for IT professionals. Close to Hinjewadi IT Park.',
      listingPurpose: ListingPurpose.RENT,
      propertyCategory: PropertyCategory.RESIDENTIAL,
      propertyTypeId: typeRecords['apartment'],
      ownerId: userRecords['owner@example.test'],
      postedByUserId: userRecords['owner@example.test'],
      postedByRole: Role.OWNER,
      bhk: 2,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      carpetArea: 850.0,
      areaUnit: AreaUnit.SQFT,
      rent: 32000.0,
      securityDeposit: 90000.0,
      maintenanceFee: 2500.0,
      furnishing: Furnishing.FULLY_FURNISHED,
      floorNumber: 5,
      totalFloors: 12,
      parkingSpaces: 1,
      facing: Facing.NORTH_EAST,
      propertyAge: PropertyAge.ONE_TO_5_YEARS,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      address: 'Flat 502, Green Meadows, Baner Road',
      cityId: cityRecords['pune'],
      localityId: localityRecords['pune_baner'],
      landmark: 'Near Baner D-Mart',
      pincode: '411045',
      latitude: 18.559,
      longitude: 73.7868,
      verificationState: VerificationState.VERIFIED,
      listingState: ListingState.ACTIVE,
      isFeatured: false,
    },
  });

  await prisma.propertyAmenity.upsert({
    where: { propertyId_amenityId: { propertyId: prop2.id, amenityId: amenityRecords['security-24-7'] } },
    update: {},
    create: { propertyId: prop2.id, amenityId: amenityRecords['security-24-7'] },
  });

  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

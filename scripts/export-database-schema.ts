/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportDatabaseSchema() {
  console.log('📊 Starting MySQL Database Schema Excel Workbook Generation...');

  const docsDir = path.join(process.cwd(), 'docs', 'database');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Housing.clone System Architect';
  workbook.lastModifiedBy = 'Housing.clone Database Architect';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette Definitions
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Dark slate
  };
  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  const sectionFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }, // Slate 200
  };

  // Helper to style header rows
  const styleHeaderRow = (row: ExcelJS.Row) => {
    row.height = 26;
    row.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF94A3B8' } },
        right: { style: 'thin', color: { argb: 'FF94A3B8' } },
      };
    });
  };

  // Helper to style data rows
  const styleDataRows = (sheet: ExcelJS.Worksheet) => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.height = 20;
      const isEven = rowNumber % 2 === 0;
      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });
  };

  // =========================================================================
  // SHEET 1: Table Summary
  // =========================================================================
  const sheetSummary = workbook.addWorksheet('Table Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetSummary.columns = [
    { header: 'No.', key: 'index', width: 8 },
    { header: 'Table Name', key: 'tableName', width: 28 },
    { header: 'Domain Module', key: 'domain', width: 28 },
    { header: 'Estimated Purpose & Business Function', key: 'purpose', width: 65 },
  ];
  styleHeaderRow(sheetSummary.getRow(1));

  const tablesMeta = [
    { name: 'users', domain: 'User & Authentication', purpose: 'User accounts, hashed passwords, contact information, roles, and account status' },
    { name: 'user_sessions', domain: 'User & Authentication', purpose: 'Active HTTP session tokens, refresh tokens, user agents, and IP addresses' },
    { name: 'otp_verifications', domain: 'User & Authentication', purpose: 'Mobile/email OTP codes, verification status, attempts, and expiration logs' },
    { name: 'states', domain: 'Geographic Location', purpose: 'State territory records (e.g. Maharashtra, Karnataka, Delhi NCR)' },
    { name: 'cities', domain: 'Geographic Location', purpose: 'City boundaries, state links, lat/lng center coordinates, popular & active flags' },
    { name: 'localities', domain: 'Geographic Location', purpose: 'City areas/neighborhoods, pincodes, and geographic coordinates' },
    { name: 'sub_localities', domain: 'Geographic Location', purpose: 'Sub-sectors and localized landmarks inside localities' },
    { name: 'property_types', domain: 'Property Catalogs', purpose: 'Property classification catalog (Apartment, Villa, Plot, Office Space, etc.)' },
    { name: 'properties', domain: 'Property & Listings', purpose: 'Main real estate listing entity containing pricing, locations, dimensions, and approval states' },
    { name: 'amenities', domain: 'Property Catalogs', purpose: 'Standardized amenity catalog (Swimming Pool, Gym, Power Backup, Security, etc.)' },
    { name: 'property_amenities', domain: 'Property & Listings', purpose: 'Junction table linking properties to individual amenities' },
    { name: 'property_media', domain: 'Property Media', purpose: 'Property photos, virtual tours, floor plans, and video URLs stored on S3' },
    { name: 'developer_organizations', domain: 'Developer & Projects', purpose: 'Real estate developer company profiles and verification records' },
    { name: 'developer_members', domain: 'Developer & Projects', purpose: 'Junction table mapping developer associates and agents to organizations' },
    { name: 'projects', domain: 'Developer & Projects', purpose: 'Major township/builder projects linked to developers and location hierarchy' },
    { name: 'project_media', domain: 'Developer & Projects', purpose: 'Project layout plans, brochures, and promotional images' },
    { name: 'project_amenities', domain: 'Developer & Projects', purpose: 'Junction table mapping amenities to builder projects' },
    { name: 'favorites', domain: 'User Engagement', purpose: 'Bookmarked/saved properties per user' },
    { name: 'saved_searches', domain: 'User Engagement', purpose: 'Saved filter criteria with optional email alert preferences' },
    { name: 'recently_viewed', domain: 'User Engagement', purpose: 'User browsing history log for property listings' },
    { name: 'enquiries', domain: 'Leads & Communication', purpose: 'Direct buyer/tenant message enquiries sent to owners/agents' },
    { name: 'leads', domain: 'Leads & Communication', purpose: 'Sales pipeline leads with status tracking (New, Contacted, Negotiating, Converted)' },
    { name: 'property_visits', domain: 'Leads & Communication', purpose: 'Scheduled site visit appointments with status tracking' },
    { name: 'notifications', domain: 'User Communication', purpose: 'In-app, email, and push notification alert queue' },
    { name: 'reports', domain: 'Moderation & Safety', purpose: 'Flagged property/user reports submitted by marketplace visitors' },
    { name: 'property_verifications', domain: 'Moderation & Safety', purpose: 'Official verification review logs recorded by platform moderators' },
    { name: 'packages', domain: 'Monetization & Billing', purpose: 'Paid seller/agent listing plans, pricing, validity, and listing limits' },
    { name: 'subscriptions', domain: 'Monetization & Billing', purpose: 'Active user package subscriptions' },
    { name: 'transactions', domain: 'Monetization & Billing', purpose: 'Payment gateway transactions with Razorpay ID and payment status' },
    { name: 'invoices', domain: 'Monetization & Billing', purpose: 'Formatted billing invoices for successful subscription purchases' },
    { name: 'refunds', domain: 'Monetization & Billing', purpose: 'Payment refund processing records' },
    { name: 'payment_webhook_events', domain: 'Monetization & Billing', purpose: 'Raw webhook payload logs for payment reconciliation' },
    { name: 'audit_logs', domain: 'System Audit', purpose: 'Immutable administrative audit trail recording admin user ID, action, and IP' },
    { name: 'user_property_preferences', domain: 'Personalization Engine', purpose: 'Inferred user preference vectors powering the Smart Discovery Feed' },
    { name: 'recommendation_feedbacks', domain: 'Personalization Engine', purpose: 'User feedback on algorithmically recommended listings' },
    { name: 'analytics_events', domain: 'Product Analytics', purpose: 'Platform analytics event stream tracking user traffic and actions' },
    { name: 'cms_contents', domain: 'Content Management', purpose: 'Managed terms, privacy policy, and dynamic CMS articles' },
    { name: 'feature_flags', domain: 'System Configuration', purpose: 'Systemwide feature toggles managed via Admin Panel' },
    { name: 'system_settings', domain: 'System Configuration', purpose: 'Platform configuration settings (Branding, Support Email, Platform Fee)' },
  ];

  tablesMeta.forEach((t, i) => {
    sheetSummary.addRow({
      index: i + 1,
      tableName: t.name,
      domain: t.domain,
      purpose: t.purpose,
    });
  });
  styleDataRows(sheetSummary);

  // =========================================================================
  // SHEET 2: Tables and Columns
  // =========================================================================
  const sheetColumns = workbook.addWorksheet('Tables and Columns', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetColumns.columns = [
    { header: 'Table Name', key: 'tableName', width: 25 },
    { header: 'Column Name', key: 'columnName', width: 28 },
    { header: 'Data Type', key: 'dataType', width: 18 },
    { header: 'Nullable', key: 'nullable', width: 12 },
    { header: 'Key Type', key: 'keyType', width: 14 },
    { header: 'Default Value', key: 'defaultValue', width: 24 },
    { header: 'Description / Purpose', key: 'description', width: 45 },
  ];
  styleHeaderRow(sheetColumns.getRow(1));

  // Query actual MySQL INFORMATION_SCHEMA for precise metadata
  const dbName = process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'housing_clone_db';
  const rawColumns: Array<{
    TABLE_NAME: string;
    COLUMN_NAME: string;
    COLUMN_TYPE: string;
    IS_NULLABLE: string;
    COLUMN_KEY: string;
    COLUMN_DEFAULT: string | null;
  }> = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME, ORDINAL_POSITION;
  `);

  rawColumns.forEach((col) => {
    let keyType = '—';
    if (col.COLUMN_KEY === 'PRI') keyType = 'PRIMARY KEY';
    else if (col.COLUMN_KEY === 'UNI') keyType = 'UNIQUE';
    else if (col.COLUMN_KEY === 'MUL') keyType = 'INDEX / FK';

    sheetColumns.addRow({
      tableName: col.TABLE_NAME,
      columnName: col.COLUMN_NAME,
      dataType: col.COLUMN_TYPE,
      nullable: col.IS_NULLABLE === 'YES' ? 'YES' : 'NO',
      keyType,
      defaultValue: col.COLUMN_DEFAULT ?? 'NULL',
      description: `Column '${col.COLUMN_NAME}' in table '${col.TABLE_NAME}'`,
    });
  });
  styleDataRows(sheetColumns);

  // =========================================================================
  // SHEET 3: Primary Keys
  // =========================================================================
  const sheetPK = workbook.addWorksheet('Primary Keys', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetPK.columns = [
    { header: 'Table Name', key: 'tableName', width: 28 },
    { header: 'Primary Key Column', key: 'columnName', width: 28 },
    { header: 'Key Generation Strategy', key: 'strategy', width: 35 },
  ];
  styleHeaderRow(sheetPK.getRow(1));

  const pkColumns = rawColumns.filter((c) => c.COLUMN_KEY === 'PRI');
  pkColumns.forEach((col) => {
    sheetPK.addRow({
      tableName: col.TABLE_NAME,
      columnName: col.COLUMN_NAME,
      strategy: col.COLUMN_TYPE.includes('varchar') ? 'CUID (Collision-resistant Unique ID)' : 'Auto Increment',
    });
  });
  styleDataRows(sheetPK);

  // =========================================================================
  // SHEET 4: Foreign Keys
  // =========================================================================
  const sheetFK = workbook.addWorksheet('Foreign Keys', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetFK.columns = [
    { header: 'Source Table', key: 'sourceTable', width: 26 },
    { header: 'Foreign Key Column', key: 'fkColumn', width: 26 },
    { header: 'Referenced Table', key: 'targetTable', width: 26 },
    { header: 'Referenced Column', key: 'targetColumn', width: 22 },
    { header: 'Constraint Name', key: 'constraintName', width: 40 },
  ];
  styleHeaderRow(sheetFK.getRow(1));

  const rawFKs: Array<{
    TABLE_NAME: string;
    COLUMN_NAME: string;
    REFERENCED_TABLE_NAME: string;
    REFERENCED_COLUMN_NAME: string;
    CONSTRAINT_NAME: string;
  }> = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME, CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME, COLUMN_NAME;
  `);

  rawFKs.forEach((fk) => {
    sheetFK.addRow({
      sourceTable: fk.TABLE_NAME,
      fkColumn: fk.COLUMN_NAME,
      targetTable: fk.REFERENCED_TABLE_NAME,
      targetColumn: fk.REFERENCED_COLUMN_NAME,
      constraintName: fk.CONSTRAINT_NAME,
    });
  });
  styleDataRows(sheetFK);

  // =========================================================================
  // SHEET 5: Relationships
  // =========================================================================
  const sheetRel = workbook.addWorksheet('Relationships', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetRel.columns = [
    { header: 'Parent Entity', key: 'parent', width: 25 },
    { header: 'Child Entity', key: 'child', width: 25 },
    { header: 'Relationship Type', key: 'relType', width: 22 },
    { header: 'Foreign Key Connection', key: 'fkInfo', width: 35 },
    { header: 'Business Cardinality Explanation', key: 'explanation', width: 55 },
  ];
  styleHeaderRow(sheetRel.getRow(1));

  const relationshipsMeta = [
    { parent: 'states', child: 'cities', type: 'One-to-Many (1:N)', fk: 'cities.stateId → states.id', exp: 'A state contains multiple cities. Each city belongs to exactly 1 state.' },
    { parent: 'cities', child: 'localities', type: 'One-to-Many (1:N)', fk: 'localities.cityId → cities.id', exp: 'A city contains multiple localities. Each locality belongs to 1 city.' },
    { parent: 'localities', child: 'sub_localities', type: 'One-to-Many (1:N)', fk: 'sub_localities.localityId → localities.id', exp: 'A locality contains multiple sub-localities.' },
    { parent: 'users', child: 'properties', type: 'One-to-Many (1:N)', fk: 'properties.ownerId → users.id', exp: 'A user (owner/agent/developer) can post multiple property listings.' },
    { parent: 'cities', child: 'properties', type: 'One-to-Many (1:N)', fk: 'properties.cityId → cities.id', exp: 'A city hosts multiple property listings.' },
    { parent: 'localities', child: 'properties', type: 'One-to-Many (1:N)', fk: 'properties.localityId → localities.id', exp: 'A locality hosts multiple property listings.' },
    { parent: 'property_types', child: 'properties', type: 'One-to-Many (1:N)', fk: 'properties.propertyTypeId → property_types.id', exp: 'A property type classifies multiple properties.' },
    { parent: 'properties', child: 'property_media', type: 'One-to-Many (1:N)', fk: 'property_media.propertyId → properties.id', exp: 'A property has multiple media items (photos, floor plans, virtual tours).' },
    { parent: 'properties', child: 'property_amenities', type: 'Many-to-Many (M:N)', fk: 'property_amenities.propertyId & amenityId', exp: 'Properties connect to amenities via junction table.' },
    { parent: 'users', child: 'favorites', type: 'One-to-Many (1:N)', fk: 'favorites.userId → users.id', exp: 'A user bookmarks multiple favorite properties.' },
    { parent: 'users', child: 'saved_searches', type: 'One-to-Many (1:N)', fk: 'saved_searches.userId → users.id', exp: 'A user saves multiple filter criteria configurations.' },
    { parent: 'properties', child: 'enquiries', type: 'One-to-Many (1:N)', fk: 'enquiries.propertyId → properties.id', exp: 'A property receives multiple user enquiries.' },
    { parent: 'properties', child: 'leads', type: 'One-to-Many (1:N)', fk: 'leads.propertyId → properties.id', exp: 'A property generates multiple buyer/tenant sales leads.' },
    { parent: 'properties', child: 'property_visits', type: 'One-to-Many (1:N)', fk: 'property_visits.propertyId → properties.id', exp: 'A property schedules multiple site visits.' },
    { parent: 'packages', child: 'subscriptions', type: 'One-to-Many (1:N)', fk: 'subscriptions.packageId → packages.id', exp: 'A seller package produces multiple user subscriptions.' },
    { parent: 'users', child: 'transactions', type: 'One-to-Many (1:N)', fk: 'transactions.userId → users.id', exp: 'A user completes multiple payment transactions.' },
    { parent: 'transactions', child: 'invoices', type: 'One-to-One (1:1)', fk: 'invoices.transactionId → transactions.id', exp: 'Each transaction generates exactly 1 billing invoice.' },
    { parent: 'users', child: 'audit_logs', type: 'One-to-Many (1:N)', fk: 'audit_logs.userId → users.id', exp: 'Administrative actions record user audit log entries.' },
  ];

  relationshipsMeta.forEach((r) => {
    sheetRel.addRow({
      parent: r.parent,
      child: r.child,
      relType: r.type,
      fkInfo: r.fk,
      explanation: r.exp,
    });
  });
  styleDataRows(sheetRel);

  // =========================================================================
  // SHEET 6: Indexes
  // =========================================================================
  const sheetIdx = workbook.addWorksheet('Indexes', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetIdx.columns = [
    { header: 'Table Name', key: 'tableName', width: 28 },
    { header: 'Index Name', key: 'indexName', width: 35 },
    { header: 'Column Name', key: 'columnName', width: 28 },
    { header: 'Unique Index', key: 'isUnique', width: 15 },
  ];
  styleHeaderRow(sheetIdx.getRow(1));

  const rawIndexes: Array<{
    TABLE_NAME: string;
    INDEX_NAME: string;
    COLUMN_NAME: string;
    NON_UNIQUE: number;
  }> = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
  `);

  rawIndexes.forEach((idx) => {
    sheetIdx.addRow({
      tableName: idx.TABLE_NAME,
      indexName: idx.INDEX_NAME,
      columnName: idx.COLUMN_NAME,
      isUnique: idx.NON_UNIQUE === 0 ? 'YES' : 'NO',
    });
  });
  styleDataRows(sheetIdx);

  // =========================================================================
  // SHEET 7: Enums
  // =========================================================================
  const sheetEnums = workbook.addWorksheet('Enums', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetEnums.columns = [
    { header: 'Enum Name', key: 'enumName', width: 25 },
    { header: 'Allowed Value Options', key: 'values', width: 70 },
    { header: 'Business Context & Usage', key: 'context', width: 50 },
  ];
  styleHeaderRow(sheetEnums.getRow(1));

  const enumsList = [
    { name: 'Role', values: 'VISITOR, TENANT_BUYER, OWNER, AGENT, DEVELOPER, MODERATOR, ADMIN, SUPER_ADMIN', context: 'RBAC user authorization level' },
    { name: 'UserStatus', values: 'PENDING, ACTIVE, SUSPENDED, DELETED', context: 'Account lifecycle status' },
    { name: 'ListingPurpose', values: 'BUY, RENT, COMMERCIAL, PG_COLIVING, PLOT', context: 'Property transaction category' },
    { name: 'PropertyCategory', values: 'RESIDENTIAL, COMMERCIAL, AGRICULTURAL, INDUSTRIAL', context: 'High-level real estate category' },
    { name: 'AreaUnit', values: 'SQFT, SQYD, ACRE, HECTARE', context: 'Carpet/built-up area measurement unit' },
    { name: 'Furnishing', values: 'UNFURNISHED, SEMI_FURNISHED, FULLY_FURNISHED', context: 'Furnishing state of property' },
    { name: 'Facing', values: 'EAST, WEST, NORTH, SOUTH, NORTH_EAST, NORTH_WEST, SOUTH_EAST, SOUTH_WEST', context: 'Vastu/geographic orientation' },
    { name: 'PropertyAge', values: 'NEW_CONSTRUCTION, LESS_THAN_1_YEAR, ONE_TO_5_YEARS, FIVE_TO_10_YEARS, TEN_PLUS_YEARS', context: 'Building construction age' },
    { name: 'PossessionStatus', values: 'READY_TO_MOVE, UNDER_CONSTRUCTION', context: 'Move-in availability status' },
    { name: 'VerificationState', values: 'UNVERIFIED, PENDING, VERIFIED, REJECTED', context: 'Admin document/listing verification state' },
    { name: 'ListingState', values: 'DRAFT, PENDING_APPROVAL, ACTIVE, PAUSED, EXPIRED, SOLD, RENTED, REJECTED', context: 'Listing publication lifecycle state' },
    { name: 'MediaType', values: 'IMAGE, VIDEO, FLOOR_PLAN, DOCUMENT_PDF, VIRTUAL_TOUR', context: 'S3 uploaded media category' },
    { name: 'LeadStatus', values: 'NEW, CONTACTED, MEETING_SCHEDULED, NEGOTIATING, CONVERTED, LOST, SPAM', context: 'CRM sales lead status pipeline' },
    { name: 'VisitStatus', values: 'SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED', context: 'Site visit appointment status' },
    { name: 'NotificationChannel', values: 'IN_APP, EMAIL, SMS, PUSH', context: 'Notification alert delivery channel' },
    { name: 'PaymentStatus', values: 'PENDING, SUCCESS, FAILED, REFUNDED', context: 'Monetization payment transaction status' },
  ];

  enumsList.forEach((e) => {
    sheetEnums.addRow({
      enumName: e.name,
      values: e.values,
      context: e.context,
    });
  });
  styleDataRows(sheetEnums);

  // =========================================================================
  // SHEET 8: Database Statistics
  // =========================================================================
  const sheetStats = workbook.addWorksheet('Database Statistics', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheetStats.columns = [
    { header: 'Metric', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 35 },
    { header: 'Description', key: 'desc', width: 50 },
  ];
  styleHeaderRow(sheetStats.getRow(1));

  const uniqueTables = Array.from(new Set(rawColumns.map((c) => c.TABLE_NAME)));
  const totalColumnsCount = rawColumns.length;
  const totalFKCount = rawFKs.length;

  const stats = [
    { metric: 'Database Engine', value: 'MySQL 8.0', desc: 'Relational database engine with InnoDB transaction support' },
    { metric: 'Database Name', value: dbName, desc: 'Primary application database schema' },
    { metric: 'Total Tables', value: String(uniqueTables.length), desc: 'Number of normalized database tables' },
    { metric: 'Total Columns', value: String(totalColumnsCount), desc: 'Total database columns across all tables' },
    { metric: 'Total Foreign Key Constraints', value: String(totalFKCount), desc: 'Relational foreign key connections' },
    { metric: 'Total Enum Types', value: String(enumsList.length), desc: 'Standardized application enum classifications' },
    { metric: 'Export Timestamp', value: new Date().toISOString(), desc: 'Exact date and time when schema workbook was generated' },
  ];

  stats.forEach((s) => {
    sheetStats.addRow({
      metric: s.metric,
      value: s.value,
      desc: s.desc,
    });
  });
  styleDataRows(sheetStats);

  // Write file
  const outputPath = path.join(docsDir, 'mysql_database_schema.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ MySQL Database Schema Excel Workbook generated at: ${outputPath}`);
}

exportDatabaseSchema()
  .catch((err) => {
    console.error('❌ Excel Export Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

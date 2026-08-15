require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Project = require('../models/Project');
const ContractorMetrics = require('../models/ContractorMetrics');
const Tender = require('../models/Tender');
const { ROLES, COMPLAINT_STATUS, SEVERITY, PRIORITY } = require('../constants');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Clearing existing data...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Project.deleteMany({});
    await ContractorMetrics.deleteMany({});
    await Tender.deleteMany({});

    // ========================
    // USERS
    // ========================
    console.log('Creating users...');

    // Citizens
    const citizen1 = await User.create({
      role: ROLES.CITIZEN,
      name: 'Ravi Kumar',
      phone: '9000000001',
      email: 'ravi@example.com',
      passwordHash: await hashPassword('Citizen@123')
    });
    const citizen2 = await User.create({
      role: ROLES.CITIZEN,
      name: 'Priya Sharma',
      phone: '9000000002',
      email: 'priya@example.com',
      passwordHash: await hashPassword('Citizen@123')
    });

    // Authority
    const authority = await User.create({
      role: ROLES.AUTHORITY,
      name: 'District Engineer',
      governmentId: 'GOV-2026-001',
      passwordHash: await hashPassword('Authority@123')
    });

    // Contractors
    const contractorA = await User.create({
      role: ROLES.CONTRACTOR,
      firmName: 'Apex Road Builders Pvt Ltd',
      gstin: '33AABCA1234F1Z5',
      contractorNumber: 'CTR-2026-001',
      passwordHash: await hashPassword('Contractor@123')
    });
    const contractorB = await User.create({
      role: ROLES.CONTRACTOR,
      firmName: 'Bharath Infra Solutions',
      gstin: '33AABCB5678G2Z6',
      contractorNumber: 'CTR-2026-002',
      passwordHash: await hashPassword('Contractor@123')
    });
    const contractorC = await User.create({
      role: ROLES.CONTRACTOR,
      firmName: 'Coimbatore Civil Works',
      gstin: '33AABCC9012H3Z7',
      contractorNumber: 'CTR-2026-003',
      passwordHash: await hashPassword('Contractor@123')
    });

    // ========================
    // CONTRACTOR METRICS
    // ========================
    console.log('Creating contractor metrics...');

    // Contractor A: Score ~92
    await ContractorMetrics.create({
      contractorId: contractorA._id,
      totalAssigned: 40,
      totalResolved: 38,
      totalOnTime: 34,
      totalQualityApproved: 37,
      totalRepeatIssues: 1,
      rectificationRate: 95,
      onTimeResolutionRate: 90,
      qualityApprovalRate: 95,
      repeatIssueScore: 85,
      budgetComplianceScore: 90,
      overallScore: 92.25,
      averageResolutionTime: 45.5
    });

    // Contractor B: Score ~76
    await ContractorMetrics.create({
      contractorId: contractorB._id,
      totalAssigned: 28,
      totalResolved: 21,
      totalOnTime: 16,
      totalQualityApproved: 19,
      totalRepeatIssues: 3,
      rectificationRate: 75,
      onTimeResolutionRate: 76,
      qualityApprovalRate: 80,
      repeatIssueScore: 70,
      budgetComplianceScore: 75,
      overallScore: 76.15,
      averageResolutionTime: 68.2
    });

    // Contractor C: Score ~41
    await ContractorMetrics.create({
      contractorId: contractorC._id,
      totalAssigned: 18,
      totalResolved: 8,
      totalOnTime: 4,
      totalQualityApproved: 6,
      totalRepeatIssues: 6,
      rectificationRate: 44,
      onTimeResolutionRate: 50,
      qualityApprovalRate: 38,
      repeatIssueScore: 30,
      budgetComplianceScore: 40,
      overallScore: 41.45,
      averageResolutionTime: 112.3
    });

    // ========================
    // SAMPLE COMPLAINTS
    // ========================
    console.log('Creating sample complaints...');

    const resolvedComplaint = await Complaint.create({
      ticketId: 'ST-2026-0001',
      citizenId: citizen2._id,
      issueType: 'Pothole',
      description: 'Large pothole on Race Course Road near BSNL office causing accidents',
      location: { latitude: 11.0168, longitude: 76.9558, address: 'Race Course Road, Coimbatore' },
      evidenceImage: null,
      aiAnalysis: { detectedIssue: 'Pothole', confidence: 0.91, severity: 'HIGH', recommendedPriority: 'URGENT', analyzedAt: new Date() },
      severity: SEVERITY.HIGH,
      priority: PRIORITY.URGENT,
      status: COMPLAINT_STATUS.RESOLVED,
      authorityId: authority._id,
      contractorId: contractorA._id,
      verification: { verified: true, remarks: 'Verified by field inspection', verifiedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000) },
      repair: {
        repairNotes: 'Pothole filled with bitumen and compacted',
        startedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        authorityApproved: true,
        authorityRemarks: 'Work quality is satisfactory',
        verifiedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000)
      },
      statusHistory: [
        { status: 'NEW', changedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000), changedBy: citizen2._id },
        { status: 'UNDER_REVIEW', changedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000), changedBy: authority._id },
        { status: 'VERIFIED', changedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), changedBy: authority._id },
        { status: 'ASSIGNED', changedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), changedBy: authority._id },
        { status: 'IN_PROGRESS', changedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000), changedBy: contractorA._id },
        { status: 'RECTIFICATION_SUBMITTED', changedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), changedBy: contractorA._id },
        { status: 'RESOLVED', changedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000), changedBy: authority._id }
      ],
      resolvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000)
    });

    await Complaint.create({
      ticketId: 'ST-2026-0002',
      citizenId: citizen1._id,
      issueType: 'Surface Damage',
      description: 'Road surface severely damaged on Avinashi Road near Tidel Park, water-logging during rains',
      location: { latitude: 11.0238, longitude: 76.9812, address: 'Avinashi Road, Coimbatore' },
      aiAnalysis: { detectedIssue: 'Surface Damage', confidence: 0.87, severity: 'HIGH', recommendedPriority: 'URGENT', analyzedAt: new Date() },
      severity: SEVERITY.HIGH,
      priority: PRIORITY.URGENT,
      status: COMPLAINT_STATUS.ASSIGNED,
      authorityId: authority._id,
      contractorId: contractorA._id,
      verification: { verified: true, remarks: 'Confirmed - urgent repair needed', verifiedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
      statusHistory: [
        { status: 'NEW', changedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000), changedBy: citizen1._id },
        { status: 'VERIFIED', changedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), changedBy: authority._id },
        { status: 'ASSIGNED', changedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), changedBy: authority._id }
      ]
    });

    await Complaint.create({
      ticketId: 'ST-2026-0003',
      citizenId: citizen2._id,
      issueType: 'Waterlogging',
      description: 'Severe waterlogging near Gandhipuram bus stand causing traffic disruption',
      location: { latitude: 11.0050, longitude: 76.9663, address: 'Gandhipuram, Coimbatore' },
      aiAnalysis: { detectedIssue: 'Waterlogging', confidence: 0.89, severity: 'HIGH', recommendedPriority: 'URGENT', analyzedAt: new Date() },
      severity: SEVERITY.HIGH,
      priority: PRIORITY.URGENT,
      status: COMPLAINT_STATUS.UNDER_REVIEW,
      statusHistory: [
        { status: 'NEW', changedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000), changedBy: citizen2._id },
        { status: 'UNDER_REVIEW', changedAt: new Date(Date.now() - 12 * 3600 * 1000), changedBy: authority._id }
      ]
    });

    await Complaint.create({
      ticketId: 'ST-2026-0004',
      citizenId: citizen1._id,
      issueType: 'Crack',
      description: 'Multiple cracks on Trichy Road near Podanur junction, road is sinking',
      location: { latitude: 10.9912, longitude: 76.9742, address: 'Trichy Road, Podanur, Coimbatore' },
      severity: SEVERITY.MEDIUM,
      priority: PRIORITY.IMPORTANT,
      status: COMPLAINT_STATUS.NEW,
      statusHistory: [
        { status: 'NEW', changedAt: new Date(Date.now() - 3 * 3600 * 1000), changedBy: citizen1._id }
      ]
    });

    await Complaint.create({
      ticketId: 'ST-2026-0005',
      citizenId: citizen2._id,
      issueType: 'Pothole',
      description: 'Deep pothole on Mettupalayam Road causing vehicle damage',
      location: { latitude: 11.0340, longitude: 76.9620, address: 'Mettupalayam Road, Coimbatore' },
      aiAnalysis: { detectedIssue: 'Pothole', confidence: 0.93, severity: 'CRITICAL', recommendedPriority: 'EMERGENCY', analyzedAt: new Date() },
      severity: SEVERITY.CRITICAL,
      priority: PRIORITY.EMERGENCY,
      status: COMPLAINT_STATUS.RECTIFICATION_SUBMITTED,
      authorityId: authority._id,
      contractorId: contractorB._id,
      verification: { verified: true, verifiedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000) },
      repair: {
        repairNotes: 'Pothole filled and road marked',
        startedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        submittedAt: new Date(Date.now() - 4 * 3600 * 1000)
      },
      statusHistory: [
        { status: 'NEW', changedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000), changedBy: citizen2._id },
        { status: 'VERIFIED', changedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), changedBy: authority._id },
        { status: 'ASSIGNED', changedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), changedBy: authority._id },
        { status: 'IN_PROGRESS', changedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), changedBy: contractorB._id },
        { status: 'RECTIFICATION_SUBMITTED', changedAt: new Date(Date.now() - 4 * 3600 * 1000), changedBy: contractorB._id }
      ]
    });

    // ========================
    // PROJECT
    // ========================
    console.log('Creating project...');

    const project = await Project.create({
      projectName: 'Avinashi Road Maintenance Package',
      roadName: 'Avinashi Road',
      description: 'Comprehensive road maintenance and resurfacing of Avinashi Road from Tidel Park to Airport Junction',
      location: { latitude: 11.0238, longitude: 76.9812, address: 'Avinashi Road, Coimbatore' },
      contractorId: contractorA._id,
      totalBudget: 10000000, // 1 Crore
      startDate: new Date('2026-01-15'),
      expectedCompletionDate: new Date('2026-12-31'),
      status: 'ACTIVE',
      createdBy: authority._id
    });

    // ========================
    // TENDER
    // ========================
    console.log('Creating tender...');

    const aScore = 92.25;
    const bScore = 76.15;
    const cScore = 41.45;
    const aQuote = 10000000; // 10 Cr
    const bQuote = 8000000;  // 8 Cr
    const cQuote = 6000000;  // 6 Cr
    const lowestQuote = Math.min(aQuote, bQuote, cQuote);

    const aPriceScore = (lowestQuote / aQuote) * 100;
    const bPriceScore = (lowestQuote / bQuote) * 100;
    const cPriceScore = (lowestQuote / cQuote) * 100;

    const aFinal = 0.80 * aScore + 0.20 * aPriceScore;
    const bFinal = 0.80 * bScore + 0.20 * bPriceScore;
    const cFinal = 0.80 * cScore + 0.20 * cPriceScore;

    const bids = [
      { contractorId: contractorA._id, quotation: aQuote, contractorPerformanceScore: aScore, priceScore: parseFloat(aPriceScore.toFixed(2)), finalTenderScore: parseFloat(aFinal.toFixed(2)) },
      { contractorId: contractorB._id, quotation: bQuote, contractorPerformanceScore: bScore, priceScore: parseFloat(bPriceScore.toFixed(2)), finalTenderScore: parseFloat(bFinal.toFixed(2)) },
      { contractorId: contractorC._id, quotation: cQuote, contractorPerformanceScore: cScore, priceScore: parseFloat(cPriceScore.toFixed(2)), finalTenderScore: parseFloat(cFinal.toFixed(2)) }
    ];

    // Rank them
    const sorted = [...bids].sort((a, b) => b.finalTenderScore - a.finalTenderScore);
    const ranked = sorted.map((bid, idx) => ({ ...bid, rank: idx + 1 }));

    await Tender.create({
      title: 'Coimbatore Urban Road Maintenance Tender 2026',
      description: 'Annual maintenance tender for Coimbatore urban road network covering major arterial roads',
      estimatedBudget: 50000000,
      bids: ranked,
      status: 'OPEN',
      createdBy: authority._id
    });

    console.log('\n===== SEED COMPLETE =====');
    console.log('\nDemo Accounts:');
    console.log('Citizen 1   - Phone: 9000000001  | Pass: Citizen@123');
    console.log('Citizen 2   - Phone: 9000000002  | Pass: Citizen@123');
    console.log('Authority   - Gov ID: GOV-2026-001 | Pass: Authority@123');
    console.log('Contractor A - ID: CTR-2026-001  | Pass: Contractor@123 | Score: 92.25');
    console.log('Contractor B - ID: CTR-2026-002  | Pass: Contractor@123 | Score: 76.15');
    console.log('Contractor C - ID: CTR-2026-003  | Pass: Contractor@123 | Score: 41.45');
    console.log('=========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();

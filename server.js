// server.js - SkillSync Maharashtra API Engine
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. In-Memory Local Database (Guarantees data loads offline or online)
const LOCAL_DATA = {
  pune_auto: {
    sectorName: "Automotive & EV Cluster (Pune / Chakan)",
    governingBody: "DVET Maharashtra / ITI Pune",
    targetSyllabus: "Diploma in Mechanical & Automobile Engineering (2021 Revised)",
    industryDemand: [
      { skill: "Battery Management Systems (BMS)", demandScore: 95, currentCoverage: 20, status: "Critical Gap" },
      { skill: "PLC & Industrial Automation", demandScore: 90, currentCoverage: 75, status: "Moderate Alignment" },
      { skill: "CAN Protocol & Vehicle Electronics", demandScore: 88, currentCoverage: 15, status: "Critical Gap" },
      { skill: "CNC Machine Operation", demandScore: 80, currentCoverage: 85, status: "Aligned" },
      { skill: "EV Safety & High Voltage Protocols", demandScore: 92, currentCoverage: 30, status: "Critical Gap" }
    ]
  },
  mumbai_it: {
    sectorName: "IT & Cloud Services (Mumbai / Hinjawadi)",
    governingBody: "MSBTE Maharashtra",
    targetSyllabus: "Diploma in Computer Engineering (2022 Scheme)",
    industryDemand: [
      { skill: "Cloud Native & AWS/Azure DevOps", demandScore: 98, currentCoverage: 35, status: "Critical Gap" },
      { skill: "Docker & Kubernetes Containerization", demandScore: 92, currentCoverage: 10, status: "Critical Gap" },
      { skill: "Java / Python Data Structures", demandScore: 85, currentCoverage: 90, status: "Aligned" },
      { skill: "Cybersecurity Incident Handling", demandScore: 89, currentCoverage: 25, status: "Critical Gap" },
      { skill: "Full Stack React / Node Development", demandScore: 94, currentCoverage: 60, status: "Moderate Alignment" }
    ]
  },
  aurangabad_pharma: {
    sectorName: "Pharma & Biotech (Chhatrapati Sambhajinagar)",
    governingBody: "MSSDS / ITI Chemical Tech",
    targetSyllabus: "Certificate in Industrial Chemical Processing",
    industryDemand: [
      { skill: "HPLC Analysis & Chromatography", demandScore: 96, currentCoverage: 45, status: "Critical Gap" },
      { skill: "Good Manufacturing Practice (GMP) 2.0", demandScore: 90, currentCoverage: 80, status: "Aligned" },
      { skill: "Automated Process Control Systems", demandScore: 87, currentCoverage: 30, status: "Critical Gap" },
      { skill: "Pharma Regulatory Compliance (FDA)", demandScore: 85, currentCoverage: 50, status: "Moderate Alignment" }
    ]
  }
};

let isMongoConnected = false;

// 2. MongoDB Schema Setup
const skillSchema = new mongoose.Schema({
  skill: String,
  demandScore: Number,
  currentCoverage: Number,
  status: String
});

const sectorSchema = new mongoose.Schema({
  sectorId: { type: String, unique: true },
  sectorName: String,
  governingBody: String,
  targetSyllabus: String,
  industryDemand: [skillSchema]
});

const Sector = mongoose.model('Sector', sectorSchema);

// Attempt Cloud Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Cloud');
      isMongoConnected = true;
    })
    .catch(() => {
      console.log('⚡ Running in High-Speed Local In-Memory Mode');
    });
} else {
  console.log('⚡ Running in High-Speed Local In-Memory Mode');
}

// 3. Analytics Endpoint
app.get('/api/analytics/:sectorId', async (req, res) => {
  try {
    let data = null;

    if (isMongoConnected) {
      data = await Sector.findOne({ sectorId: req.params.sectorId });
    }

    // Fallback to local data if Mongo is not connected or returns nothing
    if (!data) {
      data = LOCAL_DATA[req.params.sectorId] || LOCAL_DATA.pune_auto;
    }

    const totalDemand = data.industryDemand.reduce((sum, item) => sum + item.demandScore, 0);
    const totalCoverage = data.industryDemand.reduce((sum, item) => sum + (item.demandScore * (item.currentCoverage / 100)), 0);
    const alignmentScore = Math.round((totalCoverage / totalDemand) * 100);
    const gaps = data.industryDemand.filter(item => item.currentCoverage < 50);

    res.json({
      sector: data.sectorName,
      governingBody: data.governingBody,
      targetSyllabus: data.targetSyllabus,
      alignmentScore,
      totalSkillsTracked: data.industryDemand.length,
      criticalGapCount: gaps.length,
      skills: data.industryDemand
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 4. Bridge Course Endpoint
app.post('/api/generate-bridge', (req, res) => {
  const { skillName, targetSector } = req.body;
  res.json({
    title: `4-Week Industry Bridge: ${skillName}`,
    duration: "4 Weeks (30 Hours Practical / 10 Hours Theory)",
    targetSector,
    prerequisites: "Basic ITI / Polytechnic Diploma Core Knowledge",
    modules: [
      { week: 1, topic: "Fundamentals & Industry Standard Protocols", practicals: "Simulated Lab Setup & Safety Training" },
      { week: 2, topic: "Tooling, Diagnostics & Real-world Workflows", practicals: "Hands-on Equipment Calibration & Diagnostics" },
      { week: 3, topic: "Live Case Studies & Fault Injection Scenarios", practicals: "Troubleshooting Industry Simulation Kits" },
      { week: 4, topic: "Industry Assessment & MSSDS Micro-Credentialing", practicals: "Final Evaluation by Empaneled Industry Partner" }
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 SkillSync Engine running on http://localhost:${PORT}`));
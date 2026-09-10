// server.js - SkillPulse AI Engine (Phase 1)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Phase 1 Data Source (Stateless Intelligence Pipeline)
const SECTOR_DATABASE = {
  pune_ev: {
    sectorName: "Automotive & EV Cluster",
    location: "Pune / Chakan",
    course: "Diploma in EV Tech",
    industrySkills: [
      { skill: "Battery Management Systems", hist: 64, trend: 82, growth: 91, tech: 88 },
      { skill: "EV Diagnostics", hist: 70, trend: 85, growth: 89, tech: 84 },
      { skill: "CAN Bus Protocol", hist: 75, trend: 78, growth: 85, tech: 82 },
      { skill: "Battery Safety", hist: 60, trend: 75, growth: 88, tech: 80 },
      { skill: "Thermal Management", hist: 55, trend: 70, growth: 82, tech: 75 }
    ],
    courseSkills: ["Battery Basics", "Electrical Systems", "Vehicle Diagnostics", "Motor Systems", "Basic Safety"]
  },
  mumbai_it: {
    sectorName: "IT & Cloud Services",
    location: "Mumbai / Hinjawadi",
    course: "Diploma in Computer Tech",
    industrySkills: [
      { skill: "AWS / Azure DevOps", hist: 70, trend: 90, growth: 95, tech: 92 },
      { skill: "Docker & Kubernetes", hist: 60, trend: 88, growth: 92, tech: 90 },
      { skill: "Cybersecurity Incident Handling", hist: 65, trend: 80, growth: 85, tech: 88 },
      { skill: "Java / Data Structures", hist: 85, trend: 70, growth: 75, tech: 70 }
    ],
    courseSkills: ["Java / Data Structures", "Basic Networking", "Operating Systems", "Web Development"]
  }
};

// 2. Skill Intelligence Engine: Forecast Score Formula
function calculateForecastSignal(hist, trend, growth, tech) {
  // Weighted Average: 25% Hist, 35% Trend, 20% Growth, 20% Tech
  const score = Math.round((hist * 0.25) + (trend * 0.35) + (growth * 0.20) + (tech * 0.20));
  let indicator = "Stable Demand";
  if (score >= 80) indicator = "Strong Emerging Demand";
  else if (score >= 60) indicator = "Moderate Growing Demand";

  return { score, indicator };
}

// 3. Curriculum Engine: Gap Detector & Matching
function detectCurriculumGaps(industrySkills, courseSkills) {
  const courseLower = courseSkills.map(c => c.toLowerCase());

  return industrySkills.map(item => {
    const forecast = calculateForecastSignal(item.hist, item.trend, item.growth, item.tech);
    const skillLower = item.skill.toLowerCase();

    let status = "Missing";
    let matchScore = 0;

    if (courseLower.includes(skillLower)) {
      status = "Covered";
      matchScore = 100;
    } else if (courseLower.some(c => c.includes(skillLower) || skillLower.includes(c))) {
      status = "Partial";
      matchScore = 50;
    }

    return {
      skill: item.skill,
      forecastScore: forecast.score,
      indicator: forecast.indicator,
      status: status,
      matchScore: matchScore,
      breakdown: { hist: item.hist, trend: item.trend, growth: item.growth, tech: item.tech },
      why: `Job Demand: ${item.trend}%, Growth: ${item.growth}%, Tech Signal: ${item.tech}%`
    };
  });
}

// 4. API Endpoints
app.post('/api/analyze', (req, res) => {
  const sectorKey = req.body.sectorKey || "pune_ev";
  const sectorData = SECTOR_DATABASE[sectorKey] || SECTOR_DATABASE.pune_ev;

  const gapAnalysis = detectCurriculumGaps(sectorData.industrySkills, sectorData.courseSkills);
  
  const missingSkills = gapAnalysis.filter(g => g.status === "Missing" || g.status === "Partial");
  const recommendations = missingSkills.map(m => ({
    moduleTitle: `4-Week Micro-Bridge: ${m.skill}`,
    recommendedAction: `Incorporate practical laboratory modules for ${m.skill} into current curriculum.`
  }));

  res.json({
    sectorName: sectorData.sectorName,
    location: sectorData.location,
    course: sectorData.course,
    demandRadar: gapAnalysis,
    recommendations: recommendations
  });
});

// Serve frontend homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 SkillPulse AI running on http://localhost:${PORT}`));

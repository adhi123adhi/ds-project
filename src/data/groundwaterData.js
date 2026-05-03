export const GROUNDWATER_DATA = {
  districts: [
    { name: "Coimbatore", level_mbgl: 18.4, status: "low", trend: "declining", station: "CBE-MN-01", updated: "April 2026" },
    { name: "Chennai", level_mbgl: 22.1, status: "critical", trend: "declining", station: "CHN-NB-03", updated: "April 2026" },
    { name: "Madurai", level_mbgl: 14.7, status: "normal", trend: "stable", station: "MDU-CT-02", updated: "April 2026" },
    { name: "Salem", level_mbgl: 16.3, status: "low", trend: "stable", station: "SLM-AV-01", updated: "March 2026" },
    { name: "Trichy", level_mbgl: 12.9, status: "normal", trend: "improving", station: "TRY-SB-04", updated: "April 2026" },
    { name: "Tirunelveli", level_mbgl: 9.8, status: "normal", trend: "improving", station: "TVL-MN-02", updated: "April 2026" },
    { name: "Erode", level_mbgl: 19.6, status: "critical", trend: "declining", station: "ERD-BV-01", updated: "March 2026" },
    { name: "Vellore", level_mbgl: 11.2, status: "normal", trend: "stable", station: "VLR-KP-03", updated: "April 2026" },
    { name: "Thanjavur", level_mbgl: 8.5, status: "normal", trend: "improving", station: "TNJ-DL-01", updated: "April 2026" },
    { name: "Dindigul", level_mbgl: 15.8, status: "low", trend: "stable", station: "DDL-PR-02", updated: "March 2026" }
  ],
  rainfall: [
    { month: "January 2024", mm: 12.4, year: 2024, season: "winter" },
    { month: "February 2024", mm: 8.1, year: 2024, season: "winter" },
    { month: "March 2024", mm: 5.6, year: 2024, season: "summer" },
    { month: "April 2024", mm: 18.2, year: 2024, season: "summer" },
    { month: "May 2024", mm: 42.7, year: 2024, season: "summer" },
    { month: "June 2024", mm: 98.5, year: 2024, season: "monsoon" },
    { month: "July 2024", mm: 142.3, year: 2024, season: "monsoon" },
    { month: "August 2024", mm: 168.9, year: 2024, season: "monsoon" },
    { month: "September 2024", mm: 124.6, year: 2024, season: "monsoon" },
    { month: "October 2024", mm: 87.4, year: 2024, season: "monsoon" },
    { month: "November 2024", mm: 56.2, year: 2024, season: "winter" },
    { month: "December 2024", mm: 22.8, year: 2024, season: "winter" }
  ],
  water_usage: [
    { sector: "Agricultural", usage_mcm: 4820, percentage: 68.5, trend: "stable", districts: ["Thanjavur", "Trichy", "Madurai"] },
    { sector: "Industrial", usage_mcm: 1240, percentage: 17.6, trend: "increasing", districts: ["Coimbatore", "Chennai", "Erode"] },
    { sector: "Domestic", usage_mcm: 890, percentage: 12.6, trend: "increasing", districts: ["Chennai", "Coimbatore", "Madurai"] },
    { sector: "Commercial", usage_mcm: 90, percentage: 1.3, trend: "stable", districts: ["Chennai", "Coimbatore"] }
  ],
  seasonal_levels: {
    summer: { avg_mbgl: 20.3, period: "March–May", recharge_rate: "Low", districts_affected: 7 },
    monsoon: { avg_mbgl: 10.1, period: "June–November", recharge_rate: "High", districts_affected: 2 },
    winter: { avg_mbgl: 14.8, period: "December–February", recharge_rate: "Moderate", districts_affected: 4 }
  },
  monitoring_stations: [
    { id: "CBE-MN-01", district: "Coimbatore", lat: 11.0168, lon: 76.9558, type: "Automated", active: true, last_sync: "2026-04-28 06:30 IST" },
    { id: "CHN-NB-03", district: "Chennai", lat: 13.0827, lon: 80.2707, type: "Automated", active: true, last_sync: "2026-04-28 06:15 IST" },
    { id: "MDU-CT-02", district: "Madurai", lat: 9.9252, lon: 78.1198, type: "Semi-Auto", active: true, last_sync: "2026-04-27 18:00 IST" },
    { id: "TRY-SB-04", district: "Trichy", lat: 10.7905, lon: 78.7047, type: "Automated", active: true, last_sync: "2026-04-28 06:00 IST" },
    { id: "ERD-BV-01", district: "Erode", lat: 11.3410, lon: 77.7172, type: "Manual", active: false, last_sync: "2026-04-25 09:00 IST" }
  ]
};

export const SYSTEM_PROMPT = `You are the INGRESS Groundwater Data Management Assistant — an AI-powered expert on groundwater monitoring for Tamil Nadu, India.

You have access to the following live dataset (as of April 2026):

${JSON.stringify(GROUNDWATER_DATA, null, 2)}

RULES:
1. Answer ONLY groundwater, rainfall, water usage, and environmental queries.
2. If asked anything unrelated, politely redirect to groundwater topics.
3. Always cite the relevant data from the dataset in your response.
4. Use concise, structured responses. Use markdown tables where appropriate.
5. Classify district levels: >18 mbgl = CRITICAL 🔴, 12–18 = LOW 🟠, <12 = NORMAL 🟢.
6. Always mention the monitoring station ID and last update when citing a specific district's level.
7. When comparing seasons, use the seasonal_levels data.
8. Keep responses under 250 words unless asked for detail.
9. End responses with: "Source: INGRESS Monitoring Station DB — Last updated: April 2026"`;

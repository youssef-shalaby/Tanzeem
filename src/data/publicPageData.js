import { Grid3X3, LineChart, Package, ShieldCheck, Truck, Users } from "lucide-react";

import landingDashboardImg from "../assets/landing-dashboard.png";
import aboutAnalyticsImg from "../assets/about-analytics.png";
import featuresInventoryImg from "../assets/features-inventory.png";
import featuresAnalyticsImg from "../assets/features-analytics.png";

export const landingDashboardImage = landingDashboardImg;
export const aboutAnalyticsImage = aboutAnalyticsImg;
export const featuresInventoryImage = featuresInventoryImg;
export const featuresAnalyticsImage = featuresAnalyticsImg;

export const valueCards = [
  { icon: Package, title: "Efficiency First", copy: "Every second saved in the warehouse is a second spent growing your business." },
  { icon: Users, title: "People Centric", copy: "Software should be a tool that serves people, not the other way around." },
  { icon: ShieldCheck, title: "Absolute Clarity", copy: "No more guessing games. Real-time data for real-world decisions." },
];

export const capabilityCards = [
  { icon: Truck, title: "Order Tracking", copy: "End-to-end visibility" },
  { icon: Package, title: "Suppliers", copy: "Seamless partner management" },
  { icon: Users, title: "Team Roles", copy: "Granular access control" },
  { icon: ShieldCheck, title: "Secure", copy: "Enterprise-grade safety" },
];

export const featureRows = [
  {
    icon: Grid3X3,
    title: "Real-time Inventory",
    copy: "Monitor stock levels across multiple warehouses with live updates and instant synchronization.",
    bullets: ["Cloud-based synchronization", "Automated low-stock alerts"],
    image: featuresInventoryImage,
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    copy: "Identify trends and predict future stock needs based on historical data and seasonal changes.",
    bullets: ["Demand forecasting", "AI-powered recommendations"],
    image: featuresAnalyticsImage,
    reverse: true,
  },
];
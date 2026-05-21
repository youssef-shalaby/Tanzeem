import { Grid3X3, LineChart, Package, ShieldCheck, Truck, Users } from "lucide-react";

export const landingDashboardImage = "https://www.figma.com/api/mcp/asset/214947db-43fd-44d9-905d-04aba2f383b8";
export const aboutAnalyticsImage = "https://www.figma.com/api/mcp/asset/83ae285d-0161-4e52-b290-9f158c37bcc9";
export const featuresInventoryImage = "https://www.figma.com/api/mcp/asset/73732a3c-261e-4bfc-bdbd-c3e95ec8e392";
export const featuresAnalyticsImage = "https://www.figma.com/api/mcp/asset/20299c53-9870-4dfa-8a9a-dd86f8eaff2c";

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

import type { ImageSourcePropType } from "react-native";

export interface OnboardingSlide {
  id: string;
  badge: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_SLIDES: readonly OnboardingSlide[] = [
  {
    id: "tracking",
    badge: "EXPENSE & INCOME TRACKING",
    title: "Know Where Every Dollar Goes",
    body: "Effortlessly log daily transactions, categorize your spending, and monitor bank accounts in real time.",
    image: require("../../assets/images/onboarding/onboarding_1.jpg"),
  },
  {
    id: "bills",
    badge: "SUBSCRIPTION & BILL ALERTS",
    title: "Stay Ahead of Recurring Bills",
    body: "Never get surprised by an auto-renewal again. Receive automated reminders before money leaves your account.",
    image: require("../../assets/images/onboarding/onboarding_2.jpg"),
  },
  {
    id: "wealth",
    badge: "BUDGET INSIGHTS & WEALTH",
    title: "Build Budgets & Grow Wealth",
    body: "Plan your monthly spending, analyze deep financial reports, and watch your net worth climb year after year.",
    image: require("../../assets/images/onboarding/onboarding_3.jpg"),
  },
] as const;

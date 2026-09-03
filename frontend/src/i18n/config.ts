import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      dashboard: "Dashboard",
      book_slot: "Book Slot",
      live_queue: "Live Queue",
      payments: "Payments",
      notifications: "Notifications",
      profile: "Profile",
      welcome_back: "Welcome back",
      logout: "Logout",
      nearby_centres: "Nearby Centres"
    }
  },
  te: {
    translation: {
      dashboard: "డాష్‌బోర్డ్",
      book_slot: "స్లాట్ బుక్ చేయండి",
      live_queue: "లైవ్ క్యూ",
      payments: "చెల్లింపులు",
      notifications: "నోటిఫికేషన్లు",
      profile: "ప్రొఫైల్",
      welcome_back: "తిరిగి స్వాగతం",
      logout: "లాగ్అవుట్",
      nearby_centres: "సమీప కేంద్రాలు"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;

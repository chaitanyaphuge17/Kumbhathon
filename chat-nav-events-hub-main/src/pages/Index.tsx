import { useState } from "react";
import { MessageSquare, Navigation, Calendar, AlertTriangle, Home, Users, Map, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import AIChatModal from "@/components/AIChatModal";
import LiveNavigationModal from "@/components/LiveNavigationModal";
import EventScheduleModal from "@/components/EventScheduleModal";
import EmergencySOSModal from "@/components/EmergencySOSModal";
import FakeNewsControlModal from "@/components/FakeNewsControlModal";
import FacilitiesFinderModal from "@/components/FacilitiesFinderModal";
import LostAndFoundModal from "@/components/LostAndFoundModal";
import SOSButton from "@/components/SOSButton";
import kumbhLogo from "@/assets/kumbh-logo.png";

const Index = () => {
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [sosOpen, setSOSOpen] = useState(false);
  const [fakeNewsOpen, setFakeNewsOpen] = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);
  const [lostFoundOpen, setLostFoundOpen] = useState(false);

  const features = [
    {
      icon: <Navigation className="w-6 h-6 text-white" />,
      bgColor: "from-orange-500 to-amber-500",
      title: t("features.liveNav"),
      description: t("features.liveNavDesc"),
      onClick: () => setNavOpen(true),
    },
    {
      icon: <Calendar className="w-6 h-6 text-white" />,
      bgColor: "from-blue-500 to-indigo-600",
      title: t("features.events"),
      description: t("features.eventsDesc"),
      onClick: () => setEventsOpen(true),
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      bgColor: "from-teal-500 to-emerald-600",
      title: t("features.fakeNews"),
      description: t("features.fakeNewsDesc"),
      onClick: () => setFakeNewsOpen(true),
    },
    {
      icon: <Home className="w-6 h-6 text-white" />,
      bgColor: "from-rose-500 to-pink-600",
      title: t("features.facilities"),
      description: t("features.facilitiesDesc"),
      onClick: () => setFacilitiesOpen(true),
    },
    {
      icon: <Search className="w-6 h-6 text-white" />,
      bgColor: "from-purple-500 to-violet-600",
      title: t("features.lostFoundFeature"),
      description: t("features.lostFoundFeatureDesc"),
      onClick: () => setLostFoundOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-blue-50/40">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={kumbhLogo} 
              alt="Kumbh AI Assistant" 
              className="w-14 h-14 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800">{t("header.title")}</h1>
              <p className="text-xs text-gray-500">{t("header.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <nav className="flex items-center gap-4 md:gap-6">
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">{t("header.home")}</a>
              <a href="#features" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">{t("header.features")}</a>
              <a href="#about" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors hidden md:block">{t("header.about")}</a>
              <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors hidden md:block">{t("header.contact")}</a>
            </nav>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 relative overflow-hidden">

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {t("hero.badge")}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            {t("hero.title")}
          </h2>
          <h3 className="text-2xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              {t("hero.subtitle")}
            </span>
          </h3>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            {t("hero.description")}
          </p>

          {/* AI Assistant Card */}
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100 mb-12">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{t("hero.aiReady")}</h4>
            <p className="text-gray-500 mb-6 text-sm">
              {t("hero.aiDesc")}
            </p>
            <Button
              onClick={() => setChatOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-8 py-6 text-base font-semibold shadow-lg shadow-orange-200/50 hover:shadow-xl transition-all"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              {t("hero.openChat")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-16 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {t("features.title")}
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onClick={feature.onClick}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-orange-200 transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-base font-semibold text-gray-800 mb-1.5">{feature.title}</h4>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-2xl p-6 md:p-10 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white text-center">
              <div className="p-4">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold mb-1">40M+</div>
                <div className="text-sm opacity-80">{t("stats.pilgrims")}</div>
              </div>
              <div className="p-4 md:border-x md:border-white/20">
                <Map className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold mb-1">24/7</div>
                <div className="text-sm opacity-80">{t("stats.monitoring")}</div>
              </div>
              <div className="p-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold mb-1">AI</div>
                <div className="text-sm opacity-80">{t("stats.aiPowered")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{t("about.title")}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t("about.description")}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">📍 {t("about.ramkund")}</span>
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">🏔️ {t("about.tapovan")}</span>
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">🕉️ {t("about.trimbakeshwar")}</span>
            </div>
            <div className="text-2xl mt-8 text-orange-600 font-medium">{t("about.blessing")}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={kumbhLogo} alt="Kumbh" className="w-10 h-10 object-contain" />
              <span className="font-semibold">{t("header.title")}</span>
            </div>
            <p className="text-gray-400 text-sm text-center">
              {t("footer.blessing")}
            </p>
            <p className="text-xs text-gray-500">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>

      {/* SOS Button */}
      <SOSButton onClick={() => setSOSOpen(true)} />

      {/* Modals */}
      <AIChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <LiveNavigationModal isOpen={navOpen} onClose={() => setNavOpen(false)} />
      <EventScheduleModal isOpen={eventsOpen} onClose={() => setEventsOpen(false)} />
      <EmergencySOSModal isOpen={sosOpen} onClose={() => setSOSOpen(false)} />
      <FakeNewsControlModal isOpen={fakeNewsOpen} onClose={() => setFakeNewsOpen(false)} />
      <FacilitiesFinderModal isOpen={facilitiesOpen} onClose={() => setFacilitiesOpen(false)} />
      <LostAndFoundModal isOpen={lostFoundOpen} onClose={() => setLostFoundOpen(false)} />
    </div>
  );
};

export default Index;

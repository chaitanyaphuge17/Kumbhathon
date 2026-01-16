import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Event {
  id: string;
  type: string;
  titleKey: string;
  date: string;
  dateKey?: string;
  time: string;
  descKey: string;
  tagKey: string;
}

const eventsData: Event[] = [
  {
    id: "1",
    type: "snan",
    titleKey: "event1Title",
    date: "14 January",
    time: "4:00 AM – 10:00 AM",
    descKey: "event1Desc",
    tagKey: "shahiSnan",
  },
  {
    id: "2",
    type: "aarti",
    titleKey: "event2Title",
    date: "",
    dateKey: "dateDaily",
    time: "6:30 PM – 7:00 PM",
    descKey: "event2Desc",
    tagKey: "aarti",
  },
  {
    id: "3",
    type: "akharas",
    titleKey: "event3Title",
    date: "21 January",
    time: "9:00 AM",
    descKey: "event3Desc",
    tagKey: "akhara",
  },
  {
    id: "4",
    type: "cultural",
    titleKey: "event4Title",
    date: "",
    dateKey: "dateWeekend",
    time: "7:30 PM",
    descKey: "event4Desc",
    tagKey: "cultural",
  },
  {
    id: "5",
    type: "snan",
    titleKey: "event5Title",
    date: "12 February",
    time: "5:00 AM – 11:00 AM",
    descKey: "event5Desc",
    tagKey: "shahiSnan",
  },
  {
    id: "6",
    type: "aarti",
    titleKey: "event6Title",
    date: "",
    dateKey: "dateDaily",
    time: "5:30 AM – 6:00 AM",
    descKey: "event6Desc",
    tagKey: "aarti",
  },
];

interface EventScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventScheduleModal = ({ isOpen, onClose }: EventScheduleModalProps) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  
  const filteredEvents = filter === "all" ? eventsData : eventsData.filter((e) => e.type === filter);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--kumbh-orange))] to-[hsl(var(--kumbh-deep-orange))] text-white p-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-white/90 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">📅 {t("events.title")}</h3>
            <span className="text-sm opacity-90">{t("events.subtitle")}</span>
          </div>

          {/* Filter */}
          <div className="p-4 flex justify-center border-b border-border">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">{t("events.filterLabel")}</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-full border border-border bg-background text-foreground"
              >
                <option value="all">{t("events.allEvents")}</option>
                <option value="snan">{t("events.shahiSnan")}</option>
                <option value="aarti">{t("events.aarti")}</option>
                <option value="akharas">{t("events.akhara")}</option>
                <option value="cultural">{t("events.cultural")}</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-background rounded-2xl p-5 shadow-lg border-l-4 border-[hsl(var(--kumbh-orange))]"
                >
                  <h3 className="text-lg font-semibold text-[hsl(var(--kumbh-deep-orange))] mb-2">
                    {t(`events.${event.titleKey}`)}
                  </h3>
                  <div className="font-bold text-foreground mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {event.dateKey ? t(`events.${event.dateKey}`) : event.date}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {event.time}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t(`events.${event.descKey}`)}
                  </p>
                  <span className="inline-block bg-[#ffe0b2] text-[#bf360c] px-3 py-1 rounded-full text-xs font-medium">
                    {t(`events.${event.tagKey}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center p-3 text-sm text-muted-foreground border-t border-border">
            {t("events.footer")}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventScheduleModal;

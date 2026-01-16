import { X, Phone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmergencyContact {
  titleKey: string;
  number: string;
  descKey: string;
  icon: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    titleKey: "police",
    number: "112",
    descKey: "policeDesc",
    icon: "🚓",
  },
  {
    titleKey: "medical",
    number: "108",
    descKey: "medicalDesc",
    icon: "🚑",
  },
  {
    titleKey: "fire",
    number: "101",
    descKey: "fireDesc",
    icon: "🔥",
  },
  {
    titleKey: "lostFound",
    number: "+91-9876543210",
    descKey: "lostFoundDesc",
    icon: "👨‍👩‍👧",
  },
  {
    titleKey: "controlRoom",
    number: "+91-9123456789",
    descKey: "controlRoomDesc",
    icon: "🛕",
  },
  {
    titleKey: "womenHelpline",
    number: "1090",
    descKey: "womenHelplineDesc",
    icon: "🚺",
  },
];

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmergencySOSModal = ({ isOpen, onClose }: EmergencySOSModalProps) => {
  const { t } = useLanguage();

  const sendSOS = () => {
    toast.success(t("emergency.sosSuccess"), { duration: 5000 });
  };

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
          <div className="bg-gradient-to-r from-destructive to-[hsl(var(--kumbh-deep-orange))] text-white p-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-white/90 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">🚨 {t("emergency.title")}</h3>
            <span className="text-sm opacity-90">{t("emergency.subtitle")}</span>
          </div>

          {/* Emergency Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="bg-background rounded-2xl p-5 shadow-lg border-l-4 border-destructive"
                >
                  <h3 className="text-lg font-semibold text-destructive mb-2">
                    {contact.icon} {t(`emergency.${contact.titleKey}`)}
                  </h3>
                  <a
                    href={`tel:${contact.number}`}
                    className="text-2xl font-bold text-foreground mb-2 block hover:text-destructive transition-colors"
                  >
                    {contact.number}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {t(`emergency.${contact.descKey}`)}
                  </p>
                </div>
              ))}
            </div>

            {/* SOS Box */}
            <div className="bg-red-50 border-2 border-dashed border-destructive rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-destructive mb-2 flex items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6" />
                {t("emergency.sosTitle")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("emergency.sosDesc")}
              </p>
              <Button
                onClick={sendSOS}
                size="lg"
                className="bg-gradient-to-r from-destructive to-[hsl(var(--kumbh-deep-orange))] hover:opacity-90 text-xl px-8 py-6 rounded-full shadow-lg"
              >
                {t("emergency.sendSOS")}
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                {t("emergency.locationShare")}<br />
                {t("emergency.stayCalmHelp")}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center p-3 text-sm text-muted-foreground border-t border-border">
            {t("emergency.footer")}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencySOSModal;

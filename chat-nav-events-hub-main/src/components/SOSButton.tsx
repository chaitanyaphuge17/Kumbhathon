import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SOSButtonProps {
  onClick: () => void;
}

const SOSButton = ({ onClick }: SOSButtonProps) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-destructive text-white flex flex-col items-center justify-center shadow-lg hover:scale-110 transition-transform z-40 animate-pulse"
      aria-label="Emergency SOS"
    >
      <AlertCircle className="w-6 h-6" />
      <span className="text-xs font-bold">{t("sos.label")}</span>
    </button>
  );
};

export default SOSButton;

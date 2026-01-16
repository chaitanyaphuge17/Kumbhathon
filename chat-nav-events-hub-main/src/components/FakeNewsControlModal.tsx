import { useState } from "react";
import { X, AlertTriangle, CheckCircle, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface VerifiedInfo {
  id: string;
  claimKey: string;
  status: "true" | "false" | "partial";
  explanationKey: string;
}

const verifiedInfoList: VerifiedInfo[] = [
  {
    id: "1",
    claimKey: "claim1",
    status: "partial",
    explanationKey: "claim1Exp",
  },
  {
    id: "2",
    claimKey: "claim2",
    status: "false",
    explanationKey: "claim2Exp",
  },
  {
    id: "3",
    claimKey: "claim3",
    status: "true",
    explanationKey: "claim3Exp",
  },
  {
    id: "4",
    claimKey: "claim4",
    status: "false",
    explanationKey: "claim4Exp",
  },
];

interface FakeNewsControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FakeNewsControlModal = ({ isOpen, onClose }: FakeNewsControlModalProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [reportText, setReportText] = useState("");

  const filteredInfo = verifiedInfoList.filter((info) =>
    t(`fakeNews.${info.claimKey}`).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReport = () => {
    if (!reportText.trim()) {
      toast.error(t("fakeNews.reportError"));
      return;
    }
    toast.success(t("fakeNews.reportSuccess"), { duration: 4000 });
    setReportText("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "true":
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> {t("fakeNews.verifiedTrue")}
          </span>
        );
      case "false":
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
            <X className="w-3 h-3" /> {t("fakeNews.falseInfo")}
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3" /> {t("fakeNews.partiallyTrue")}
          </span>
        );
    }
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
          <div className="bg-gradient-to-r from-[hsl(var(--kumbh-teal))] to-[hsl(var(--kumbh-blue))] text-white p-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-white/90 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">⚠️ {t("fakeNews.title")}</h3>
            <span className="text-sm opacity-90">{t("fakeNews.subtitle")}</span>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("fakeNews.searchPlaceholder")}
                className="pl-10 rounded-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Verified Claims */}
            <h4 className="text-lg font-semibold mb-4">{t("fakeNews.verifiedInfo")}</h4>
            <div className="grid gap-4 mb-8">
              {filteredInfo.map((info) => (
                <div
                  key={info.id}
                  className="bg-background rounded-xl p-4 shadow-md border-l-4 border-[hsl(var(--kumbh-teal))]"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h5 className="font-medium text-foreground">"{t(`fakeNews.${info.claimKey}`)}"</h5>
                    {getStatusBadge(info.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t(`fakeNews.${info.explanationKey}`)}</p>
                </div>
              ))}
            </div>

            {/* Report Section */}
            <div className="bg-muted rounded-2xl p-6">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--kumbh-orange))]" />
                {t("fakeNews.reportTitle")}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {t("fakeNews.reportDesc")}
              </p>
              <Textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder={t("fakeNews.reportPlaceholder")}
                className="mb-4"
                rows={3}
              />
              <Button
                onClick={handleReport}
                className="bg-[hsl(var(--kumbh-teal))] hover:bg-[hsl(var(--kumbh-teal))]/90"
              >
                <Send className="w-4 h-4 mr-2" />
                {t("fakeNews.submitReport")}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center p-3 text-sm text-muted-foreground border-t border-border">
            {t("fakeNews.footer")}
          </div>
        </div>
      </div>
    </>
  );
};

export default FakeNewsControlModal;

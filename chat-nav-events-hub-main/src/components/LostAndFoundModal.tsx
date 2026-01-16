import { useState, useEffect } from "react";
import { X, Search, Plus, User, Package, FileText, HelpCircle, Phone, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LostFoundItem {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  last_seen_location: string | null;
  contact_name: string;
  contact_phone: string;
  status: string;
  created_at: string;
}

interface LostAndFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LostAndFoundModal = ({ isOpen, onClose }: LostAndFoundModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"view" | "report">("view");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: "lost" as "lost" | "found",
    category: "person",
    name: "",
    description: "",
    last_seen_location: "",
    contact_name: "",
    contact_phone: "",
  });

  const categories = [
    { value: "person", labelKey: "person", icon: <User className="w-4 h-4" /> },
    { value: "child", labelKey: "child", icon: <User className="w-4 h-4" /> },
    { value: "elderly", labelKey: "elderly", icon: <User className="w-4 h-4" /> },
    { value: "document", labelKey: "document", icon: <FileText className="w-4 h-4" /> },
    { value: "other", labelKey: "other", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, filter, categoryFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("lost_and_found")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("type", filter);
      }
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error(t("lostFound.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.contact_name || !formData.contact_phone) {
      toast.error(t("lostFound.fillRequired"));
      return;
    }

    try {
      const { error } = await supabase.from("lost_and_found").insert({
        type: formData.type,
        category: formData.category,
        name: formData.name,
        description: formData.description,
        last_seen_location: formData.last_seen_location || null,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
      });

      if (error) throw error;

      toast.success(t("lostFound.reportSuccess"));
      setFormData({
        type: "lost",
        category: "person",
        name: "",
        description: "",
        last_seen_location: "",
        contact_name: "",
        contact_phone: "",
      });
      setActiveTab("view");
      fetchItems();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(t("lostFound.reportError"));
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || <HelpCircle className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-white to-orange-50/30 rounded-2xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden border border-orange-100">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600"></div>
            <div className="relative p-5 text-center text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-xl font-bold">{t("lostFound.title")}</h3>
              <p className="text-sm opacity-90 mt-1">{t("lostFound.subtitle")}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-orange-100">
            <button
              onClick={() => setActiveTab("view")}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeTab === "view"
                  ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("lostFound.viewReports")}
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === "report"
                  ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Plus className="w-4 h-4" />
              {t("lostFound.reportNew")}
            </button>
          </div>

          {activeTab === "view" ? (
            <>
              {/* Search & Filters */}
              <div className="p-4 border-b border-orange-100 bg-white/80 space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("lostFound.searchPlaceholder")}
                    className="pl-12 h-12 rounded-xl border-orange-200"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "all"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
                    }`}
                  >
                    {t("lostFound.all")}
                  </button>
                  <button
                    onClick={() => setFilter("lost")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "lost"
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-red-50 border border-gray-200"
                    }`}
                  >
                    🔴 {t("lostFound.lost")}
                  </button>
                  <button
                    onClick={() => setFilter("found")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "found"
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-green-50 border border-gray-200"
                    }`}
                  >
                    🟢 {t("lostFound.found")}
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-500">{t("lostFound.loading")}</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-500">{t("lostFound.noReports")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                          item.type === "lost" ? "border-l-red-500" : "border-l-green-500"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.type === "lost"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  item.type === "lost"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {item.type === "lost" ? t("lostFound.lost") : t("lostFound.found")}
                              </span>
                              <span className="text-xs text-gray-400">
                                {t(`lostFound.${item.category}`)}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                            {item.last_seen_location && (
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.last_seen_location}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatDate(item.created_at)}
                              </div>
                              <a
                                href={`tel:${item.contact_phone}`}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <Phone className="w-3 h-3" />
                                {t("lostFound.contact")}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Report Form */
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Type Selection */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "lost" })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    formData.type === "lost"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-red-50"
                  }`}
                >
                  🔴 {t("lostFound.reportLost")}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "found" })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    formData.type === "found"
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-green-50"
                  }`}
                >
                  🟢 {t("lostFound.reportFound")}
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("lostFound.category")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        formData.category === cat.value
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                      }`}
                    >
                      {cat.icon}
                      {t(`lostFound.${cat.labelKey}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("lostFound.name")} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("lostFound.namePlaceholder")}
                  className="rounded-xl"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("lostFound.description")} *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("lostFound.descriptionPlaceholder")}
                  className="rounded-xl min-h-[100px]"
                  required
                />
              </div>

              {/* Last Seen Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("lostFound.lastSeenLocation")}
                </label>
                <Input
                  value={formData.last_seen_location}
                  onChange={(e) => setFormData({ ...formData, last_seen_location: e.target.value })}
                  placeholder={t("lostFound.locationPlaceholder")}
                  className="rounded-xl"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("lostFound.contactName")} *
                  </label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder={t("lostFound.contactNamePlaceholder")}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("lostFound.contactPhone")} *
                  </label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder={t("lostFound.contactPhonePlaceholder")}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl py-3 font-medium"
              >
                {t("lostFound.submitReport")}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100 p-3">
            <p className="text-center text-sm text-gray-600">
              {t("lostFound.footer")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LostAndFoundModal;

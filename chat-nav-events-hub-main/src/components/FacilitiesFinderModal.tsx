import { useState } from "react";
import { X, MapPin, Search, Utensils, Stethoscope, Hotel, Toilet, Droplet, ShoppingBag, Tent, Bus, Phone, Warehouse, Shield, Shirt, Camera, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface Facility {
  id: string;
  type: string;
  name: string;
  distance: string;
  address: string;
  timings: string;
  phone?: string;
  icon: React.ReactNode;
}

const facilities: Facility[] = [
  // Medical Facilities
  {
    id: "1",
    type: "medical",
    name: "Siddhi Medicals",
    distance: "0.4 km",
    address: " Panchavati Karanja Rd, Panchavati Karanja, Panchavati, Nashik, Maharashtra 422003",
    timings: "10:00 AM - 7:00 PM",
    phone: " 090283 87774",
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: "2",
    type: "medical",
    name: "Apollo Pharmacy",
    distance: "5.2 km",
    address: "Shop No B4, B5, B6, Ground Floor, Madhusudhan Park, Wadala Pathardi Road, Indira Nagar, Nashik-422008, Maharashtra",
    timings: "24/7",
    phone :"07942692175",
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: "3",
    type: "medical",
    name: "KARWA LIFE CARE",
    distance: "3.3 km",
    address: "06, Archit Center Apartment, Near Sandeep Hotel, Shri Hari Kute Marg, Mumbai Naka, Nashik-422001, Maharashtra",
    timings: "10:00 AM - 7:00 PM",
    phone: "09724794583",
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: "4",
    type: "medical",
    name: "Wellness Forever",
    distance: "3.3 km",
    address: "No 717/1B/23/1A Polt No 1A/1, Patil Mala S K Niwas, Opposite Maleria Stop and Near Woodland Showroom, Patil Lane No 1 and HPT College Road, College Road, Nashik-422005, Maharashtra",
    timings: "24/7",
    phone: "07947427607",
    icon: <Stethoscope className="w-5 h-5" />,
  },
  // Food & Langar
  {
    id: "5",
    type: "food",
    name: "Sunder Hotel",
    distance: "7.0 km",
    address: " P 17, Road C, MIDC Area, Satpur Colony, Nashik, Maharashtra 422007",
    timings: "7:00 AM - 9:00 PM",
    icon: <Utensils className="w-5 h-5" />,
  },
  {
    id: "6",
    type: "food",
    name: " Panchvati Food center",
    distance: "1.3 km",
    address: "Old Adgaon Naka, Adgaon Naka, Panchavati, Nashik, Maharashtra 422003",
    timings: "8:00 AM - 9:00 PM",
    icon: <Utensils className="w-5 h-5" />,
  },
  {
    id: "7",
    type: "food",
    name: "Bhagwantrao Mithai",
    distance: "0.7 km",
    address: " Bhagwantrao Mithai, 27, Main Rd, Bohorpatti, Raviwar Karanja, Panchavati, Nashik, Maharashtra 422001",
    timings: "7:00 AM - 10:00 PM",
    icon: <Utensils className="w-5 h-5" />,
  },
  // Accommodation
  {
    id: "8",
    type: "stay",
    name: "Hotel Vaishali",
    distance: "3 km",
    address: "480-k Gole Colony Nashik 422002 Land mark Maher signal, 422002 Nashik, India",
    timings: "Check-in: 8 AM - 8 PM",
    phone: "0253-2523500",
    icon: <Hotel className="w-5 h-5" />,
  },
  {
    id: "9",
    type: "stay",
    name: "Hotel Panchavati Elite Inn",
    distance: "1.0 km",
    address: "Paritej Nagar",
    timings: "24/7 Reception",
    icon: <Tent className="w-5 h-5" />,
  },
  {
    id: "10",
    type: "stay",
    name: "Hotel Panchvati Yatri",
    distance: "1.5 km",
    address: "430, Vakil Wadi (Chandak Wadi) M. G. Road, Panchavati, Nashik, India, 422001",
    timings: "Prior Booking Required",
    icon: <Hotel className="w-5 h-5" />,
  },
  // Toilets & Sanitation
  {
    id: "11",
    type: "toilet",
    name: "Sulabh Shauchalaya - Ramkund",
    distance: "0.1 km",
    address: "Ramkund Ghat Entrance",
    timings: "24/7",
    icon: <Toilet className="w-5 h-5" />,
  },
  {
    id: "12",
    type: "toilet",
    name: "Mobile Toilet Block - Tapovan",
    distance: "0.6 km",
    address: "Tapovan Main Road",
    timings: "24/7",
    icon: <Toilet className="w-5 h-5" />,
  },
  // Transport
  {
    id: "15",
    type: "transport",
    name: "Sinnar Bus Stand",
    distance: "1.3 km",
    address: " RXVV+MQJ, sinnar bus, Sinnar, 422103",
    timings: "24/7",
    icon: <Bus className="w-5 h-5" />,
  },
  {
    id: "16",
    type: "transport",
    name: "Nashik Road Railway Station",
    distance: "12 km",
    address: "WRXR+6QW, P&T Colony, Rajwada Nagar, Deolali Gaon, Nashik, Maharashtra 422101",
    timings: "24/7",
    icon: <Bus className="w-5 h-5" />,
  },
  // Shops & Essentials
  {
    id: "17",
    type: "shop",
    name: "Bafna Bazaar",
    distance: "2.7 km",
    address: " Shop No 2, Bafna Bazaar, Agra - Mumbai Hwy, near Union Bank, Laxmi Nagar, Panchavati, Amrutdham, Nashik, Maharashtra 422003Sector 3, Mela Ground",
    timings: "9:00 AM - 2:00 PM, 4:00 PM - 9:00 PM",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    id: "18",
    type: "shop",
    name: "Nilesh Collection",
    distance: "0.2 km",
    address: "Makhmalabad Rd, Rajpal Colony, Panchavati, Nashik, Maharashtra 422003",
    timings: "9:00 AM - 10:30 PM",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  // Police & Security
  {
    id: "21",
    type: "police",
    name: "Panchvati Police Station",
    distance: "0.4 km",
    address: "2Q8W+7M5, Lok Sahakar Nagar Rd, opp. Krushi Utpanna Market, Adityakunj Society, Panchavati, Nashik, Maharashtra 422003",
    timings: "24/7",
    phone: "100 / 0253-2523100",
    icon: <Shield className="w-5 h-5" />,
  },
  // Changing Rooms
  
];

interface FacilitiesFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FacilitiesFinderModal = ({ isOpen, onClose }: FacilitiesFinderModalProps) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filterOptions = [
    { value: "all", labelKey: "all", icon: "🏛️" },
    { value: "medical", labelKey: "medical", icon: "🏥" },
    { value: "food", labelKey: "food", icon: "🍲" },
    { value: "stay", labelKey: "stay", icon: "🏨" },
    { value: "toilet", labelKey: "toilet", icon: "🚻" },,
    { value: "transport", labelKey: "transport", icon: "🚌" },
    { value: "shop", labelKey: "shop", icon: "🛒" },
    { value: "police", labelKey: "police", icon: "👮" },
    ];

  const filteredFacilities = facilities.filter((f) => {
    const matchesFilter = filter === "all" || f.type === filter;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.address.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-red-50 text-red-600 border-red-200";
      case "food":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "stay":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "toilet":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "water":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "transport":
        return "bg-violet-50 text-violet-600 border-violet-200";
      case "shop":
        return "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200";
      case "cloakroom":
        return "bg-slate-50 text-slate-600 border-slate-200";
      case "police":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "lostandfound":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "changing":
        return "bg-teal-50 text-teal-600 border-teal-200";
      case "photo":
        return "bg-pink-50 text-pink-600 border-pink-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "medical": return "border-l-red-500";
      case "food": return "border-l-amber-500";
      case "stay": return "border-l-indigo-500";
      case "toilet": return "border-l-emerald-500";
      case "water": return "border-l-sky-500";
      case "transport": return "border-l-violet-500";
      case "shop": return "border-l-fuchsia-500";
      case "cloakroom": return "border-l-slate-500";
      case "police": return "border-l-blue-600";
      case "lostandfound": return "border-l-orange-500";
      case "changing": return "border-l-teal-500";
      case "photo": return "border-l-pink-500";
      default: return "border-l-gray-400";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="w-full max-w-5xl max-h-[90vh] bg-gradient-to-b from-white to-orange-50/30 rounded-2xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden border border-orange-100">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M20 0L40 20L20 40L0 20z" fill="%23fff" fill-opacity="0.1"/%3E%3C/svg%3E")' }}></div>
            <div className="relative p-5 text-center text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-3xl mb-2">🏛️</div>
              <h3 className="text-xl font-bold">{t("facilities.title")}</h3>
              <p className="text-sm opacity-90 mt-1">{t("facilities.subtitle")}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b border-orange-100 bg-white/80 backdrop-blur-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("facilities.searchPlaceholder")}
                className="pl-12 h-12 rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400/20 bg-white shadow-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    filter === option.value
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200"
                      : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <span>{option.icon}</span>
                  <span className="hidden sm:inline">{t(`facilities.${option.labelKey}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Facilities List */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent to-orange-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 border-l-4 ${getBorderColor(facility.type)}`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${getTypeColor(facility.type)}`}
                    >
                      {facility.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-800 mb-1 truncate">
                        {facility.name}
                      </h5>
                      <div className="flex items-center gap-2 text-sm text-orange-600 font-medium mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{facility.distance}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1 truncate">
                        📍 {facility.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        ⏰ {facility.timings}
                      </p>
                      {facility.phone && (
                        <a 
                          href={`tel:${facility.phone.split('/')[0].trim()}`}
                          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Phone className="w-3 h-3" />
                          {facility.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFacilities.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">{t("facilities.noResults")}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100 p-3">
            <p className="text-center text-sm text-gray-600">
              {t("facilities.footer")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacilitiesFinderModal;

import React, { useState } from "react";
import { useGetCities, getGetCitiesQueryKey } from "@workspace/api-client-react";
import { useT } from "@/lib/i18n";
import { MapPin, Thermometer, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { CityScene } from "@/components/CityScene";

export function Explore() {
  const t = useT();
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const queryParams = {
    ...(regionFilter !== "all" && { region: regionFilter }),
    ...(budgetFilter !== "all" && { budget: parseInt(budgetFilter) })
  };

  const { data, isLoading, error } = useGetCities(queryParams, { 
    query: { 
      enabled: true,
      queryKey: getGetCitiesQueryKey(queryParams)
    } 
  });

  const filteredCities = (data?.cities || []).filter(city => {
    if (!search) return true;
    return city.city.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 bg-background pt-12 md:pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="section-heading">
          <h2>{t("explore" as any)}</h2>
          <p>{t("exploreSubtitle" as any)}</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-10 p-4 bg-white rounded-2xl shadow-sm border border-border">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder={t("searchPlaceholder" as any)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm text-primary font-medium"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg flex-1 min-w-[200px]">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <select 
                className="bg-transparent border-none outline-none w-full text-sm text-primary font-medium"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="all">{t("allRegions")}</option>
                <option value="africa">{t("africa")}</option>
                <option value="asia">{t("asia")}</option>
                <option value="europe">{t("europe")}</option>
                <option value="middle_east">{t("middleEast")}</option>
                <option value="north_america">{t("northAmerica")}</option>
                <option value="oceania">{t("oceania")}</option>
                <option value="south_america">{t("southAmerica")}</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg flex-1 min-w-[200px]">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                className="bg-transparent border-none outline-none w-full text-sm text-primary font-medium"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
              >
                <option value="all">{t("allBudgets")}</option>
                <option value="1">{t("budgetLow")}</option>
                <option value="2">{t("budgetMid")}</option>
                <option value="3">{t("budgetPremium")}</option>
              </select>
            </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-premium h-72 animate-pulse bg-secondary/10" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 card-premium">
            <h3 className="text-xl font-bold text-primary">{t("errorTitle")}</h3>
            <p className="text-muted-foreground mt-2">{t("errorSubtitle")}</p>
          </div>
        )}

        {data && filteredCities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.map((city, i) => (
              <motion.div 
                key={`${city.city}-${i}`}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card-premium overflow-hidden group flex flex-col"
              >
                <CityScene city={city.city} className="h-44 w-full shrink-0" />
                <div className="p-5 flex flex-col flex-1 gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-primary">{city.city}</h3>
                      <p className="text-sm text-muted-foreground">{city.country}</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/20 text-foreground">
                      {city.budget_label}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2 flex-1">
                    {city.cluster_profile}
                  </p>
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <Thermometer className="w-3.5 h-3.5" /> {city.temp_avg_yearly}°C
                  </div>
                  
                  <div className="border-t border-border pt-3 mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 shrink-0" /> {city.country}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {data && filteredCities.length === 0 && !isLoading && (
          <div className="text-center py-20 card-premium">
            <h3 className="text-xl font-bold text-primary">{t("noResults")}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

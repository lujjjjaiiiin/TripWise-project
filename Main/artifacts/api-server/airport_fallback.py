"""
TripWise AI — nearest major commercial/international airport fallback.

Used when the primary CSV airport data is missing, a helipad, or a military base
(identified by iata == None after null-filtering).

Every entry verified against real IATA data and geographic proximity.
"""

# Maps city name (as it appears in the dataset) → nearest practical commercial airport.
AIRPORT_FALLBACK: dict[str, dict[str, str]] = {
    # ── Europe ───────────────────────────────────────────────────────────────
    "Rio de Janeiro":        {"name": "Rio de Janeiro Galeão International Airport",    "iata": "GIG"},
    "Warsaw":                {"name": "Warsaw Chopin Airport",                          "iata": "WAW"},
    "Verona":                {"name": "Verona Villafranca Airport",                     "iata": "VRN"},
    "Freiburg":              {"name": "EuroAirport Basel-Mulhouse-Freiburg",            "iata": "BSL"},
    "Stockholm":             {"name": "Stockholm Arlanda Airport",                      "iata": "ARN"},
    "Granada":               {"name": "Federico García Lorca Granada-Jaén Airport",     "iata": "GRX"},
    "Madrid":                {"name": "Adolfo Suárez Madrid–Barajas Airport",           "iata": "MAD"},
    "Turin":                 {"name": "Turin Airport",                                  "iata": "TRN"},
    "Toulouse":              {"name": "Toulouse-Blagnac Airport",                       "iata": "TLS"},
    "Tallinn":               {"name": "Lennart Meri Tallinn Airport",                   "iata": "TLL"},
    "Sintra":                {"name": "Lisbon Humberto Delgado Airport",                "iata": "LIS"},
    "Zermatt":               {"name": "Zurich Airport",                                 "iata": "ZRH"},
    "York":                  {"name": "Leeds Bradford Airport",                         "iata": "LBA"},
    "Lübeck":                {"name": "Hamburg Airport",                                "iata": "HAM"},
    "Rostock":               {"name": "Rostock-Laage Airport",                         "iata": "RLG"},
    "Nuremberg":             {"name": "Nuremberg Airport",                              "iata": "NUE"},
    "Heidelberg":            {"name": "Frankfurt Airport",                              "iata": "FRA"},
    "Biarritz":              {"name": "Biarritz Pays Basque Airport",                  "iata": "BIQ"},
    "Hvar":                  {"name": "Split Airport",                                  "iata": "SPU"},
    "Bled":                  {"name": "Ljubljana Jože Pučnik Airport",                  "iata": "LJU"},
    "Piran":                 {"name": "Trieste Airport",                                "iata": "TRS"},
    "Essaouira":             {"name": "Essaouira-Mogador Airport",                     "iata": "ESU"},
    "Chefchaouen":           {"name": "Tangier Ibn Battouta Airport",                  "iata": "TNG"},
    "Seville":               {"name": "Seville Airport",                               "iata": "SVQ"},
    "Ronda":                 {"name": "Málaga Airport",                                "iata": "AGP"},
    "Asturias":              {"name": "Asturias Airport",                              "iata": "OVD"},
    "Hallstatt":             {"name": "Salzburg Airport W. A. Mozart",                 "iata": "SZG"},
    "Monaco":                {"name": "Nice Côte d'Azur Airport",                      "iata": "NCE"},
    "San Marino":            {"name": "Federico Fellini International Airport",         "iata": "RMI"},
    "Valletta":              {"name": "Malta International Airport",                    "iata": "MLA"},
    "Gothenburg":            {"name": "Gothenburg Landvetter Airport",                  "iata": "GOT"},
    "Malmö":                 {"name": "Copenhagen Airport",                             "iata": "CPH"},
    "Utrecht":               {"name": "Amsterdam Airport Schiphol",                    "iata": "AMS"},
    "Bruges":                {"name": "Brussels Airport",                               "iata": "BRU"},
    "Ghent":                 {"name": "Brussels Airport",                               "iata": "BRU"},
    "Keswick":               {"name": "Newcastle International Airport",                "iata": "NCL"},
    "Isle of Skye":          {"name": "Inverness Airport",                              "iata": "INV"},
    "Bath":                  {"name": "Bristol Airport",                                "iata": "BRS"},
    "Cornwall":              {"name": "Cornwall Airport Newquay",                       "iata": "NQY"},
    "Lagos":                 {"name": "Faro Airport",                                   "iata": "FAO"},  # Portugal
    "Vilamoura":             {"name": "Faro Airport",                                   "iata": "FAO"},
    "Lucca":                 {"name": "Pisa International Airport",                     "iata": "PSA"},
    "Matera":                {"name": "Bari Karol Wojtyla Airport",                    "iata": "BRI"},
    "Puglia":                {"name": "Bari Karol Wojtyla Airport",                    "iata": "BRI"},
    "Taormina":              {"name": "Catania-Fontanarossa Airport",                   "iata": "CTA"},
    "Sicily":                {"name": "Catania-Fontanarossa Airport",                   "iata": "CTA"},
    "Sardinia":              {"name": "Cagliari Elmas Airport",                         "iata": "CAG"},
    "Sidi Bou Said":         {"name": "Tunis-Carthage International Airport",           "iata": "TUN"},
    "Kairouan":              {"name": "Monastir Habib Bourguiba International Airport", "iata": "MIR"},

    # ── Middle East ───────────────────────────────────────────────────────────
    "Manama":                {"name": "Bahrain International Airport",                  "iata": "BAH"},
    "Wadi Rum":              {"name": "King Hussein International Airport",              "iata": "AQJ"},
    "Petra":                 {"name": "King Hussein International Airport",              "iata": "AQJ"},
    "Kuwait City":           {"name": "Kuwait International Airport",                   "iata": "KWI"},
    "Giza":                  {"name": "Cairo International Airport",                    "iata": "CAI"},
    "Siwa Oasis":            {"name": "Mersa Matruh Airport",                           "iata": "MUH"},

    # ── Africa ────────────────────────────────────────────────────────────────
    "Namibia":               {"name": "Hosea Kutako International Airport",             "iata": "WDH"},
    "Stone Town":            {"name": "Zanzibar International Airport",                 "iata": "ZNZ"},
    "Port Louis":            {"name": "Sir Seewoosagur Ramgoolam International Airport","iata": "MRU"},

    # ── Asia ──────────────────────────────────────────────────────────────────
    "Hanoi":                 {"name": "Noi Bai International Airport",                  "iata": "HAN"},
    "Hoi An":                {"name": "Da Nang International Airport",                  "iata": "DAD"},
    "Sapa":                  {"name": "Noi Bai International Airport",                  "iata": "HAN"},
    "Da Lat":                {"name": "Lien Khuong Airport",                            "iata": "DLI"},
    "Macau":                 {"name": "Macau International Airport",                    "iata": "MFM"},
    "Yangshuo":              {"name": "Guilin Liangjiang International Airport",         "iata": "KWL"},
    "Nara":                  {"name": "Kansai International Airport",                   "iata": "KIX"},
    "Kyoto":                 {"name": "Kansai International Airport",                   "iata": "KIX"},
    "Takayama":              {"name": "Chubu Centrair International Airport",           "iata": "NGO"},
    "Bagan":                 {"name": "Nyaung U Airport",                               "iata": "NYU"},
    "Naypyidaw":             {"name": "Naypyidaw Airport",                              "iata": "NYT"},
    "Raja Ampat":            {"name": "Domine Eduard Osok Airport",                     "iata": "SOQ"},
    "Palawan":               {"name": "Puerto Princesa International Airport",          "iata": "PPS"},
    "Siem Reap":             {"name": "Siem Reap International Airport",               "iata": "REP"},
    "Phnom Penh":            {"name": "Phnom Penh International Airport",               "iata": "PNH"},
    "Kandy":                 {"name": "Bandaranaike International Airport",             "iata": "CMB"},
    "Nuwara Eliya":          {"name": "Bandaranaike International Airport",             "iata": "CMB"},
    "Galle":                 {"name": "Mattala Rajapaksa International Airport",        "iata": "HRI"},

    # ── Seychelles ────────────────────────────────────────────────────────────
    "Seychelles":            {"name": "Seychelles International Airport",               "iata": "SEZ"},
    "Victoria":              {"name": "Seychelles International Airport",               "iata": "SEZ"},

    # ── Oceania / Pacific ─────────────────────────────────────────────────────
    "Queenstown":            {"name": "Queenstown Airport",                             "iata": "ZQN"},
    "Tanna Island":          {"name": "Whitegrass Airport",                             "iata": "TAH"},
    "Port Vila":             {"name": "Bauerfield International Airport",               "iata": "VLI"},
    "Palau":                 {"name": "Roman Tmetuchl International Airport",           "iata": "ROR"},
    "Rarotonga":             {"name": "Rarotonga International Airport",                "iata": "RAR"},
    "Tahiti":                {"name": "Faa'a International Airport",                    "iata": "PPT"},
    "Suva":                  {"name": "Nausori International Airport",                  "iata": "SUV"},
    "Lautoka":               {"name": "Nadi International Airport",                     "iata": "NAN"},
    "Nadi":                  {"name": "Nadi International Airport",                     "iata": "NAN"},

    # ── Americas ─────────────────────────────────────────────────────────────
    "Antigua":               {"name": "La Aurora International Airport",                "iata": "GUA"},  # Guatemala
    "Guanajuato":            {"name": "Del Bajío International Airport",                "iata": "BJX"},
    "Tulum":                 {"name": "Cancún International Airport",                   "iata": "CUN"},
    "Los Cabos":             {"name": "Los Cabos International Airport",                "iata": "SJD"},
    "Bocas del Toro":        {"name": "Bocas del Toro Airport",                         "iata": "BOC"},
    "St. George's":          {"name": "Maurice Bishop International Airport",           "iata": "GND"},
    "Monteverde":            {"name": "Juan Santamaría International Airport",          "iata": "SJO"},
    "Salento":               {"name": "El Edén Airport",                                "iata": "AXM"},  # Colombia
    "Caracas":               {"name": "Simón Bolívar International Airport",            "iata": "CCS"},
    "Salvador da Bahia":     {"name": "Deputado Luís Eduardo Magalhães Int'l Airport",  "iata": "SSA"},
    "Santiago de Chile":     {"name": "Arturo Merino Benítez International Airport",    "iata": "SCL"},
    "San Pedro de Atacama":  {"name": "El Loa Airport",                                 "iata": "CJC"},
    "Machu Picchu":          {"name": "Alejandro Velasco Astete International Airport", "iata": "CUZ"},
    "El Chaltén":            {"name": "El Calafate International Airport",              "iata": "FTE"},
    "San Carlos de Bariloche": {"name": "Teniente Luis Candelaria Airport",             "iata": "BRC"},
    "Bariloche":             {"name": "Teniente Luis Candelaria Airport",               "iata": "BRC"},
    "Montevideo":            {"name": "Carrasco International Airport",                 "iata": "MVD"},
    "Harare":                {"name": "Robert Gabriel Mugabe International Airport",    "iata": "HRE"},
}

import { 
  Card, 
  FormLayout, 
  Select, 
  LegacyStack, 
  Text,
  Banner,
  Tag,
  Button,
  Checkbox,
  ButtonGroup,
} from "@shopify/polaris";
import { useState } from "react";
import PropTypes from "prop-types";

// Popular countries for quick selection
const POPULAR_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "NZ", name: "New Zealand" },
  { code: "SG", name: "Singapore" },
];

// All countries list (ISO 3166-1 alpha-2 codes)
const ALL_COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cape Verde" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MK", name: "Macedonia" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SZ", name: "Swaziland" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

export function GeoTargeting({ formData, onChange }) {
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  // Parse selected countries from JSON string
  const getSelectedCountries = () => {
    try {
      return formData.geoTargetedCountries 
        ? JSON.parse(formData.geoTargetedCountries) 
        : [];
    } catch {
      return [];
    }
  };

  // Add a country to the selected countries list
  const handleAddCountry = () => {
    if (!selectedCountry) return;
    
    const currentCountries = getSelectedCountries();
    if (!currentCountries.includes(selectedCountry)) {
      const updatedCountries = [...currentCountries, selectedCountry];
      onChange({ 
        ...formData, 
        geoTargetedCountries: JSON.stringify(updatedCountries) 
      });
    }
    setSelectedCountry("");
  };

  // Remove a country from the selected countries list
  const handleRemoveCountry = (countryCode) => {
    const currentCountries = getSelectedCountries();
    const updatedCountries = currentCountries.filter(code => code !== countryCode);
    onChange({ 
      ...formData, 
      geoTargetedCountries: JSON.stringify(updatedCountries) 
    });
  };

  // Add all popular countries
  const handleSelectAllPopular = () => {
    const popularCodes = POPULAR_COUNTRIES.map(c => c.code);
    onChange({ 
      ...formData, 
      geoTargetedCountries: JSON.stringify(popularCodes) 
    });
  };

  // Clear all countries
  const handleClearAll = () => {
    onChange({ 
      ...formData, 
      geoTargetedCountries: JSON.stringify([]) 
    });
  };

  const selectedCountries = getSelectedCountries();
  
  // Get country name from code
  const getCountryName = (code) => {
    const country = ALL_COUNTRIES.find(c => c.code === code);
    return country ? country.name : code;
  };

  const modeOptions = [
    { label: "All countries (no geo-targeting)", value: "all" },
    { label: "Only show in selected countries", value: "include" },
    { label: "Hide in selected countries", value: "exclude" },
  ];

  const countryOptions = [
    { label: "Select a country...", value: "" },
    ...ALL_COUNTRIES.map(country => ({
      label: country.name,
      value: country.code,
    })),
  ];

  const isEnabled = formData.geoTargetingEnabled;
  const mode = formData.geoTargetingMode || "all";

  return (
    <Card sectioned>
      <LegacyStack vertical spacing="loose">
        <Text variant="headingLg" as="h2">
          Geo-Targeting
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          Target your bar to specific countries or regions.
        </Text>

        <FormLayout>
          {/* Enable Geo-Targeting */}
          <Checkbox
            label="Enable geo-targeting"
            checked={isEnabled}
            onChange={handleFieldChange("geoTargetingEnabled")}
            helpText="Show or hide bars based on visitor's country"
          />

          {isEnabled && (
            <>
              {/* Targeting Mode */}
              <Select
                label="Targeting mode"
                options={modeOptions}
                value={mode}
                onChange={handleFieldChange("geoTargetingMode")}
                helpText="Choose how to apply geo-targeting rules"
              />

              {mode !== "all" && (
                <>
                  <Banner status="info">
                    Country detection uses the visitor&apos;s IP address. If detection fails, 
                    the bar will {mode === "include" ? "not show" : "show"} to ensure the best user experience.
                  </Banner>

                  {/* Quick Select Popular Countries */}
                  <div>
                    <LegacyStack vertical spacing="tight">
                      <Text variant="bodyMd" as="p" fontWeight="medium">
                        Quick Select
                      </Text>
                      <ButtonGroup>
                        <Button onClick={handleSelectAllPopular}>
                          Select Popular Countries
                        </Button>
                        <Button onClick={handleClearAll}>
                          Clear All
                        </Button>
                      </ButtonGroup>
                      <Text variant="bodySm" as="p" color="subdued">
                        Popular countries include: US, CA, GB, AU, DE, FR, IT, ES, and more
                      </Text>
                    </LegacyStack>
                  </div>

                  {/* Country Selector */}
                  <div>
                    <LegacyStack vertical spacing="tight">
                      <Text variant="bodyMd" as="p" fontWeight="medium">
                        Selected Countries
                      </Text>
                      <LegacyStack>
                        <div style={{ flex: 1 }}>
                          <Select
                            label=""
                            options={countryOptions}
                            value={selectedCountry}
                            onChange={setSelectedCountry}
                          />
                        </div>
                        <Button onClick={handleAddCountry} disabled={!selectedCountry}>
                          Add Country
                        </Button>
                      </LegacyStack>
                      
                      {selectedCountries.length > 0 && (
                        <>
                          <Text variant="bodySm" as="p" color="subdued">
                            {selectedCountries.length} {selectedCountries.length === 1 ? 'country' : 'countries'} selected
                          </Text>
                          <LegacyStack spacing="tight">
                            {selectedCountries.map((code) => (
                              <Tag key={code} onRemove={() => handleRemoveCountry(code)}>
                                {getCountryName(code)}
                              </Tag>
                            ))}
                          </LegacyStack>
                        </>
                      )}
                      
                      {selectedCountries.length === 0 && (
                        <Banner status="warning">
                          Add at least one country to {mode === "include" ? "show" : "hide"} the bar
                        </Banner>
                      )}
                    </LegacyStack>
                  </div>
                </>
              )}
            </>
          )}
        </FormLayout>
      </LegacyStack>
    </Card>
  );
}

GeoTargeting.propTypes = {
  formData: PropTypes.shape({
    geoTargetingEnabled: PropTypes.bool,
    geoTargetingMode: PropTypes.string,
    geoTargetedCountries: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

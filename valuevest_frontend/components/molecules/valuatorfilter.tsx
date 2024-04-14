import React, { useState } from 'react';
import { View, Modal, ScrollView, Pressable } from 'react-native';
import { Text, Button, Checkbox, Menu, Provider, Divider, Searchbar } from 'react-native-paper';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { valuatorStyles } from './../../components/styles/valuatorstyle';
import { set } from 'lodash';

interface FilterModalProps {
  visible: boolean;
  onApply: (filters: { industry_group?: string; model?: string; country?: string; exchange?:string }) => void; 
  onClose: () => void;
}

const ValuatorFilterModal: React.FC<FilterModalProps> = ({ visible, onApply, onClose }) => {

  const [industry_group, setIndustryGroup] = useState<string>();
  const [model, setModel] = useState<string>();
  const [country, setCountry] = useState<string>();
  const [exchange, setExchange] = useState<string>();

  const [industryGroupSearchQuery, setIndustryGroupSearchQuery] = useState('');
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState('');

  const [showIndustryGroupDropdown, setShowIndustryGroupDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);

  const onResetFilters = () => {
    setIndustryGroup(undefined);
    setModel(undefined);
    setCountry(undefined);
    setExchange(undefined);
    setShowIndustryGroupDropdown(false);
    setShowModelDropdown(false);
    setShowCountryDropdown(false);
    setShowExchangeDropdown(false);
    setIndustryGroupSearchQuery('');
    setModelSearchQuery('');
    setCountrySearchQuery('');
    setExchangeSearchQuery('');
  };

  const industryGroups = [
    'Advertising',
    'Aerospace/Defense',
    'Air Transport',
    'Apparel',
    'Auto & Truck',
    'Auto Parts',
    'Bank (Money Center)',
    'Banks (Regional)',
    'Beverage (Alcoholic)',
    'Beverage (Soft)',
    'Broadcasting',
    'Brokerage & Investment Banking',
    'Building Materials',
    'Business & Consumer Services',
    'Cable TV',
    'Chemical (Basic)',
    'Chemical (Diversified)',
    'Chemical (Specialty)',
    'Coal & Related Energy',
    'Computer Services',
    'Computers/Peripherals',
    'Construction Supplies',
    'Diversified',
    'Drugs (Biotechnology)',
    'Drugs (Pharmaceutical)',
    'Education',
    'Electrical Equipment',
    'Electronics (Consumer & Office)',
    'Electronics (General)',
    'Engineering/Construction',
    'Entertainment',
    'Environmental & Waste Services',
    'Farming/Agriculture',
    'Financial Svcs. (Non-bank & Insurance)',
    'Food Processing',
    'Food Wholesalers',
    'Furn/Home Furnishings',
    'Green & Renewable Energy',
    'Healthcare Products',
    'Healthcare Support Services',
    'Heathcare Information and Technology',
    'Homebuilding',
    'Hospitals/Healthcare Facilities',
    'Hotel/Gaming',
    'Household Products',
    'Information Services',
    'Insurance (General)',
    'Insurance (Life)',
    'Insurance (Prop/Cas.)',
    'Investments & Asset Management',
    'Machinery',
    'Metals & Mining',
    'Office Equipment & Services',
    'Oil/Gas (Integrated)',
    'Oil/Gas (Production and Exploration)',
    'Oil/Gas Distribution',
    'Oilfield Svcs/Equip.',
    'Packaging & Container',
    'Paper/Forest Products',
    'Power',
    'Precious Metals',
    'Publishing & Newspapers',
    'R.E.I.T.',
    'Real Estate (Development)',
    'Real Estate (General/Diversified)',
    'Real Estate (Operations & Services)',
    'Recreation',
    'Reinsurance',
    'Restaurant/Dining',
    'Retail (Automotive)',
    'Retail (Building Supply)',
    'Retail (Distributors)',
    'Retail (General)',
    'Retail (Grocery and Food)',
    'Retail (REITs)',
    'Retail (Special Lines)',
    'Rubber& Tires',
    'Semiconductor',
    'Semiconductor Equip',
    'Shipbuilding & Marine',
    'Shoe',
    'Software (Entertainment)',
    'Software (Internet)',
    'Software (System & Application)',
    'Steel',
    'Telecom (Wireless)',
    'Telecom. Equipment',
    'Telecom. Services',
    'Tobacco',
    'Transportation',
    'Transportation (Railroads)',
    'Trucking',
    'Utility (General)',
    'Utility (Water)',
  ];

  const models = [
    'DCF',
    'DCF (Negative Revenues)',
    'ERM',
    'ERM (High-Growth)',
  ];

  const countries = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'The Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo, Democratic Republic of the',
    'Congo, Republic of the',
    'Costa Rica',
    'Côte d’Ivoire',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'East Timor (Timor-Leste)',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'The Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Korea, North',
    'Korea, South',
    'Kosovo',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia, Federated States of',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar (Burma)',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Sudan, South',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe'
  ];
  
  const exchanges = [
    'NYSE',
    'NasdaqGS',
    'NasdaqGM',
    'LSE',
    'OTCPK',
    'NYSEAM',
    'NasdaqCM',
    'SEHK',
    'AMEX',
    'OTC',
    'TSX',
    'TSXV',
    'ASX',
    'NZX',
    'Euronext',
    'SIX',
    'HKEX',
    'TSE',
    'SSE',
    'SZSE',
    'WBAG',
    'BSE',
    'NSE',
    'JSE',
    'BM&F Bovespa',
    'MOEX',
    'BIST',
    'BCBA',
    'BCS',
    'BVC',
  ];

  return (
    <Provider>
      <Modal visible={visible} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
          <Button onPress={() => setShowIndustryGroupDropdown(!showIndustryGroupDropdown)}>
            Industry Group: {industry_group || 'Select'}
          </Button>
          {showIndustryGroupDropdown && (
            <View style={{ marginTop: 10 }}>
              <Searchbar
                placeholder="Search"
                onChangeText={setIndustryGroupSearchQuery}
                value={industryGroupSearchQuery}
              />
              {industryGroups.filter(group => group.includes(industryGroupSearchQuery)).map((group) => (
                <Pressable
                  key={group}
                  onPress={() => {
                    setIndustryGroup(group);
                    setShowIndustryGroupDropdown(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{group}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Divider style={{ marginVertical: 10 }} />

          <Button onPress={() => setShowModelDropdown(!showModelDropdown)}>
            Model: {model || 'Select'}
          </Button>
          {showModelDropdown && (
            <View style={{ marginTop: 10 }}>
              <Searchbar
                placeholder="Search"
                onChangeText={setModelSearchQuery}
                value={modelSearchQuery}
              />
              {models.filter(model => model.includes(modelSearchQuery)).map((model) => (
                <Pressable
                  key={model}
                  onPress={() => {
                    setModel(model);
                    setShowModelDropdown(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{model}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Divider style={{ marginVertical: 10 }} />

          <Button onPress={() => setShowCountryDropdown(!showCountryDropdown)}>
            Country: {country || 'Select'}
          </Button>
          {showCountryDropdown && (
            <View style={{ marginTop: 10 }}>
              <Searchbar
                placeholder="Search"
                onChangeText={setCountrySearchQuery}
                value={countrySearchQuery}
              />
              {countries.filter(country => country.includes(countrySearchQuery)).map((country) => (
                <Pressable
                  key={country}
                  onPress={() => {
                    setCountry(country);
                    setShowCountryDropdown(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{country}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Divider style={{ marginVertical: 10 }} />

          <Button onPress={() => setShowExchangeDropdown(!showExchangeDropdown)}>
            Exchange: {exchange || 'Select'}
          </Button>
          {showExchangeDropdown && (
            <View style={{ marginTop: 10 }}>
              <Searchbar
                placeholder="Search"
                onChangeText={setExchangeSearchQuery}
                value={exchangeSearchQuery}
              />
              {exchanges.filter(exchange => exchange.includes(exchangeSearchQuery)).map((exchange) => (
                <Pressable
                  key={exchange}
                  onPress={() => {
                    setExchange(exchange);
                    setShowExchangeDropdown(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{exchange}</Text>
                </Pressable>
              ))}
            </View>
          )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Button onPress={onClose}>
            Cancel
          </Button>

          <Button onPress={onResetFilters}>
            Reset Filters
          </Button>

          <Button onPress={() => {
            onApply({ industry_group, model, country, exchange });
            onClose();
          }}>
            Apply
          </Button>
        </View>

        </ScrollView>
      </Modal>
    </Provider>
  );
  
};

export default ValuatorFilterModal;
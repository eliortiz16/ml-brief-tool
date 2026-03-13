
import { Country, FormData, Brand, Theme } from './types';

export const COUNTRIES: Country[] = [
  Country.AR,
  Country.BR,
  Country.CH,
  Country.CO,
  Country.MX,
  Country.PE,
  Country.UY,
];

// Step 3 Options
export const TARGET_AUDIENCE_OPTIONS = [
  "Usuarios de internet 18+",
  "Usuarios activos Mercado Libre",
  "Usuarios activos Mercado Pago",
  "Nuevos usuarios",
  "Heavy users",
  "Sellers"
];

export const FIRST_PARTY_TYPES_OPTIONS = [
  "Compradores",
  "Visitantes",
  "Sellers",
  "Wallet users",
  "Audiencias CRM",
  "Lookalikes"
];

export const CULTURAL_TERRITORY_OPTIONS = [
  "Fútbol",
  "F1",
  "Música",
  "Tenis",
  "Gen Z",
  "Mujeres"
];

// Step 4 Options
export const SOCIAL_ACTION_TYPES = [
  "NSMF",
  "SMF",
  "SMA",
  "SAO (Fashion)"
];

export const ASSET_FORMAT_OPTIONS = [
  "Video", 
  "Display", 
  "Social", 
  "OOH", 
  "Rich Media", 
  "Otros"
];

// Taxonomy Hierarchy (Brand -> Level 1 -> Level 2)
export const TAXONOMY_DATA: Record<string, Record<string, string[]>> = {
  [Brand.MELI]: {
    "FEEL": ["Emotional", "Punch", "Reg. Sponsors"],
    "THINK": ["Functional", "Loyalty", "Local Sponsors", "Cobrand"],
    "DO": ["FE T1", "FE T2", "Regalería", "PPS", "Double Dates"],
    "SOCIAL AO": ["Fashion"],
    "ACTIVACIONES PUNTUALES": ["Acts. puntuales"],
    "PARQUE FIJO": ["Parque fijo"]
  },
  [Brand.MP]: {
    "THINK": ["Funcional de producto", "Social", "Proyectos especiales", "Parque fijo", "AO Sellers", "Sponsorship"],
    "DO": ["Product & Promotion"],
    "OTHERS": ["Acts. puntuales"]
  }
};

export const INITIAL_FORM_DATA: FormData = {
  // Brief Settings
  owner: '',
  collaborators: [],
  status: 'Draft',

  brand: '',
  country: '',
  campaignName: '',
  namingConvention: '',
  level1: '',
  level2: '',
  toolId: '',
  
  // Step 2 Initial Data
  creativeConcept: '',
  materialQuantity: 0,
  materialFormats: [],
  assetsAvailability: '',
  assetsDeliveryDate: '',
  assetLink: '',

  // Step 3 Initial Data
  targetAudience: '',
  useFirstPartyData: '',
  firstPartyAudienceTypes: [],
  culturalTerritory: [],

  // Step 4 Initial Data
  totalBudget: 0,
  currency: 'Local',
  funnel: {
    upper: 0,
    middle: 0,
    lower: 0,
  },
  effectiveFrequency: 0,
  wearOutLimit: 0,
  socialActionType: '',
  socialInvestmentPercent: 0,
  socialKPI: '',

  // Step 5 Initial Data
  useOpti: '',
  useMMM: '',
  mmmOnPercent: 0,
  mmmOffPercent: 0,

  // Asana Integration (Future)
  asana_task_id: '',
  asana_project: '',
  assigned_market_team: '',
};

// Assets - Updated to stable versions
export const LOGO_MELI = "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png";
export const LOGO_MP = "https://http2.mlstatic.com/storage/mshops-appearance-api/images/73/253303873/logo-20210201115501.png";

// Themes
export const THEME_MELI: Theme = {
  primary: '#3483fa', // ML Blue for buttons
  secondary: '#fff159', // ML Yellow
  headerBg: '#fff159', // Yellow Header
  logoUrl: LOGO_MELI,
};

export const THEME_MP: Theme = {
  primary: '#009EE3', // MP Blue for buttons
  secondary: '#009EE3',
  headerBg: '#009EE3', // Blue Header
  logoUrl: LOGO_MP,
};

export const DEFAULT_THEME: Theme = THEME_MELI;

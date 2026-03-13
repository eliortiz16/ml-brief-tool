
export enum Country {
  AR = 'AR',
  BR = 'BR',
  CH = 'CH',
  CO = 'CO',
  MX = 'MX',
  PE = 'PE',
  UY = 'UY',
}

export enum Brand {
  MELI = 'Mercado Libre',
  MP = 'Mercado Pago',
}

export enum StrategyLevel {
  FEEL = 'FEEL',
  THINK = 'THINK',
  DO = 'DO',
}

export enum AssetAvailability {
  AVAILABLE = 'Sí',
  NOT_AVAILABLE = 'No',
  IN_PRODUCTION = 'En producción',
}

export interface FunnelDistribution {
  upper: number;
  middle: number;
  lower: number;
}

export interface ActivityLogEntry {
  id: string;
  userEmail: string;
  action: string;
  timestamp: string;
}

export interface FormData {
  id?: string;
  // Brief Settings
  owner: string;
  collaborators: string[];
  status: 'Draft' | 'In Progress' | 'Ready to Submit' | 'Submitted' | 'Archived';
  activityLog?: ActivityLogEntry[];

  // Step 1: Campaign
  brand: Brand | '';
  country: Country | '';
  campaignName: string;       // Obligatorio
  namingConvention: string;   // Opcional
  level1: string;             // Obligatorio
  level2: string;             // Obligatorio
  toolId: string;             // Opcional
  
  // Step 2: Creativity
  creativeConcept: string;
  materialQuantity: number;
  materialFormats: string[];
  assetsAvailability: AssetAvailability | '';
  assetsDeliveryDate: string;
  assetLink: string;

  // Step 3: Audience
  targetAudience: string;
  useFirstPartyData: string;
  firstPartyAudienceTypes: string[];
  culturalTerritory: string[];

  // Step 4: Strategy (Media + Social)
  totalBudget: number;             // Obligatorio
  currency: 'Local' | 'USD';       // Obligatorio
  funnel: FunnelDistribution;      // Suma 100% obligatoria
  effectiveFrequency: number;      // Opcional
  wearOutLimit: number;            // Opcional
  socialActionType: string;        // Obligatorio
  socialInvestmentPercent: number; // Regla dura basada en Level 1
  socialKPI: string;               // Opcional

  // Step 5: Tools
  useOpti: string;                 // Obligatorio 'Sí'/'No'
  useMMM: string;                  // Opcional 'Sí'/'No'
  mmmOnPercent: number;            // Condicional
  mmmOffPercent: number;           // Condicional

  // Asana Integration (Future)
  asana_task_id?: string;
  asana_project?: string;
  assigned_market_team?: string;
}

export enum AppStep {
  CAMPAIGN = 0,
  CREATIVITY = 1,
  STRATEGY = 2,
  SOCIAL = 3,
  TOOLS = 4,
  SUCCESS = 5,
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface Theme {
  primary: string;
  secondary: string;
  headerBg: string;
  logoUrl: string;
}

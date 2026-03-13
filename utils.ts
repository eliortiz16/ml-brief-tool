import { FormData, AppStep, ActivityLogEntry } from './types';

export const generateActivityLogs = (oldData: FormData, newData: FormData, userEmail: string): ActivityLogEntry[] => {
  const logs: ActivityLogEntry[] = [];
  const now = new Date().toISOString();

  const createLog = (action: string) => ({
    id: Math.random().toString(36).substring(2, 9),
    userEmail,
    action,
    timestamp: now
  });

  // Check status change to Submitted
  if (oldData.status !== 'Submitted' && newData.status === 'Submitted') {
    logs.push(createLog('envió el brief'));
  }

  // Check collaborators added
  const addedCollabs = (newData.collaborators || []).filter(c => !(oldData.collaborators || []).includes(c));
  addedCollabs.forEach(c => {
    logs.push(createLog(`agregó a ${c.split('@')[0]} como colaborador`));
  });

  // Check collaborators removed
  const removedCollabs = (oldData.collaborators || []).filter(c => !(newData.collaborators || []).includes(c));
  removedCollabs.forEach(c => {
    logs.push(createLog(`eliminó a ${c.split('@')[0]} como colaborador`));
  });

  // Check sections updated
  const sectionsChanged = new Set<string>();

  // Campaign section fields
  if (
    oldData.brand !== newData.brand ||
    oldData.country !== newData.country ||
    oldData.campaignName !== newData.campaignName ||
    oldData.namingConvention !== newData.namingConvention ||
    oldData.level1 !== newData.level1 ||
    oldData.level2 !== newData.level2 ||
    oldData.toolId !== newData.toolId
  ) {
    sectionsChanged.add('Campaña');
  }

  // Creativity section fields
  if (
    oldData.creativeConcept !== newData.creativeConcept ||
    oldData.materialQuantity !== newData.materialQuantity ||
    JSON.stringify(oldData.materialFormats) !== JSON.stringify(newData.materialFormats) ||
    oldData.assetsAvailability !== newData.assetsAvailability ||
    oldData.assetsDeliveryDate !== newData.assetsDeliveryDate ||
    oldData.assetLink !== newData.assetLink
  ) {
    sectionsChanged.add('Creatividad');
  }

  // Audience section fields
  if (
    oldData.targetAudience !== newData.targetAudience ||
    oldData.useFirstPartyData !== newData.useFirstPartyData ||
    JSON.stringify(oldData.firstPartyAudienceTypes) !== JSON.stringify(newData.firstPartyAudienceTypes) ||
    JSON.stringify(oldData.culturalTerritory) !== JSON.stringify(newData.culturalTerritory)
  ) {
    sectionsChanged.add('Audiencia');
  }

  // Strategy section fields
  if (
    oldData.totalBudget !== newData.totalBudget ||
    oldData.currency !== newData.currency ||
    JSON.stringify(oldData.funnel) !== JSON.stringify(newData.funnel) ||
    oldData.effectiveFrequency !== newData.effectiveFrequency ||
    oldData.wearOutLimit !== newData.wearOutLimit ||
    oldData.socialActionType !== newData.socialActionType ||
    oldData.socialInvestmentPercent !== newData.socialInvestmentPercent ||
    oldData.socialKPI !== newData.socialKPI
  ) {
    sectionsChanged.add('Estrategia');
  }

  // Tools section fields
  if (
    oldData.useOpti !== newData.useOpti ||
    oldData.useMMM !== newData.useMMM ||
    oldData.mmmOnPercent !== newData.mmmOnPercent ||
    oldData.mmmOffPercent !== newData.mmmOffPercent
  ) {
    sectionsChanged.add('Herramientas');
  }

  sectionsChanged.forEach(section => {
    logs.push(createLog(`actualizó la sección ${section}`));
  });

  return logs;
};

export const getStepStatus = (step: AppStep, formData: FormData): 'completed' | 'in-progress' | 'not-started' => {
  if (!formData) return 'not-started';
  
  let isCompleted = false;
  let isStarted = false;

  switch (step) {
    case AppStep.CAMPAIGN: {
      const fields = [formData.brand, formData.country, formData.campaignName?.trim(), formData.level1, formData.level2];
      isStarted = fields.some(f => !!f);
      isCompleted = fields.every(f => !!f);
      break;
    }
    case AppStep.CREATIVITY: {
      const fieldsFilled = [
        !!formData.creativeConcept?.trim(),
        formData.materialQuantity > 0,
        formData.materialFormats?.length > 0,
        !!formData.assetsAvailability
      ];
      isStarted = fieldsFilled.some(f => f);
      isCompleted = fieldsFilled.every(f => f);
      break;
    }
    case AppStep.STRATEGY: {
      const fieldsFilled = [
        !!formData.targetAudience,
        !!formData.useFirstPartyData
      ];
      isStarted = fieldsFilled.some(f => f);
      isCompleted = fieldsFilled.every(f => f);
      break;
    }
    case AppStep.SOCIAL: {
      const funnelTotal = (formData.funnel?.upper || 0) + (formData.funnel?.middle || 0) + (formData.funnel?.lower || 0);
      const level1 = formData.level1?.toUpperCase() || '';
      const investment = formData.socialInvestmentPercent || 0;
      let socialInvestmentValid = true;
      if (level1 === 'DO' && investment < 30) socialInvestmentValid = false;
      if ((level1 === 'FEEL' || level1 === 'THINK') && investment < 15) socialInvestmentValid = false;

      const fieldsFilled = [
        formData.totalBudget > 0,
        funnelTotal === 100,
        !!formData.socialActionType,
        socialInvestmentValid
      ];
      
      isStarted = formData.totalBudget > 0 || funnelTotal > 0 || !!formData.socialActionType || investment > 0;
      isCompleted = fieldsFilled.every(f => f);
      break;
    }
    case AppStep.TOOLS: {
      isStarted = !!formData.useOpti || !!formData.useMMM;
      isCompleted = !!formData.useOpti;
      break;
    }
  }

  if (isCompleted) return 'completed';
  if (isStarted) return 'in-progress';
  return 'not-started';
};

export const calculateProgress = (formData: FormData): number => {
  if (!formData) return 0;
  
  const steps = [
    AppStep.CAMPAIGN,
    AppStep.CREATIVITY,
    AppStep.STRATEGY,
    AppStep.SOCIAL,
    AppStep.TOOLS
  ];

  const completedSteps = steps.filter(step => getStepStatus(step, formData) === 'completed').length;
  return Math.round((completedSteps / steps.length) * 100);
};

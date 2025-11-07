// Plan definitions and configurations
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    viewLimit: 2500,
    features: [
      '2,500 views/month',
      'Basic announcement bars',
      'Countdown timers',
      'Free shipping bars',
      'Email capture'
    ]
  },
  starter: {
    name: 'Starter',
    price: 5.99,
    viewLimit: 15000,
    features: [
      '15,000 views/month',
      'All Free features',
      'Advanced targeting',
      'Geo-targeting',
      'Priority support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 11.99,
    viewLimit: 100000,
    features: [
      '100,000 views/month',
      'All Starter features',
      'Multi-message rotation',
      'Advanced analytics',
      'Custom scheduling'
    ]
  },
  scale: {
    name: 'Scale',
    price: 19.99,
    viewLimit: Infinity,
    features: [
      'Unlimited views',
      'All Pro features',
      'White-label options',
      'Dedicated support',
      'Custom integrations'
    ]
  }
};

export const PLAN_NAMES = Object.keys(PLANS);

export function getPlanByName(planName) {
  return PLANS[planName.toLowerCase()] || PLANS.free;
}

export function getViewLimit(planName) {
  const plan = getPlanByName(planName);
  return plan.viewLimit;
}

export function hasReachedViewLimit(currentViews, planName) {
  const limit = getViewLimit(planName);
  if (limit === Infinity) return false;
  return currentViews >= limit;
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const measurementId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID || '';
const hostname = import.meta.env.PUBLIC_GA_HOSTNAME || '';

export const analyticsMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId) ? measurementId : '';
export const analyticsHostname = /^[a-z0-9.-]+$/i.test(hostname) ? hostname.toLowerCase() : '';
export const analyticsEnabled = Boolean(import.meta.env.PROD && analyticsMeasurementId && analyticsHostname);

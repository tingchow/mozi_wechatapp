/** 后端 alertFrequency 枚举 */
export const ALERT_FREQUENCY_API = {
  CONTINUOUS: 'continuous',
  DAILY_ONCE: 'daily_once',
  ONCE_ONLY: 'once_only',
};

export const ALERT_FREQUENCY_UI = {
  CONTINUOUS: 'continuous',
  DAILY: 'daily',
  ONCE: 'once',
};

export const MAX_WEBHOOK_URLS = 5;

const API_TO_UI = {
  [ALERT_FREQUENCY_API.CONTINUOUS]: ALERT_FREQUENCY_UI.CONTINUOUS,
  [ALERT_FREQUENCY_API.DAILY_ONCE]: ALERT_FREQUENCY_UI.DAILY,
  [ALERT_FREQUENCY_API.ONCE_ONLY]: ALERT_FREQUENCY_UI.ONCE,
  daily: ALERT_FREQUENCY_UI.DAILY,
  once: ALERT_FREQUENCY_UI.ONCE,
};

const UI_TO_API = {
  [ALERT_FREQUENCY_UI.CONTINUOUS]: ALERT_FREQUENCY_API.CONTINUOUS,
  [ALERT_FREQUENCY_UI.DAILY]: ALERT_FREQUENCY_API.DAILY_ONCE,
  [ALERT_FREQUENCY_UI.ONCE]: ALERT_FREQUENCY_API.ONCE_ONLY,
};

export function alertFrequencyFromApi(apiValue) {
  if (apiValue == null || apiValue === '') {
    return ALERT_FREQUENCY_UI.DAILY;
  }
  return API_TO_UI[String(apiValue)] || ALERT_FREQUENCY_UI.DAILY;
}

export function alertFrequencyToApi(uiValue) {
  return UI_TO_API[String(uiValue)] || ALERT_FREQUENCY_API.DAILY_ONCE;
}

export function parseWebhookUrlsFromConfig(config) {
  if (!config || typeof config !== 'object') return [''];
  if (Array.isArray(config.webhookUrls)) {
    if (config.webhookUrls.length === 0) return [''];
    const list = config.webhookUrls.map((u) => String(u));
    if (list.length > MAX_WEBHOOK_URLS) return list.slice(0, MAX_WEBHOOK_URLS);
    return list;
  }
  if (typeof config.webhookUrl === 'string' && config.webhookUrl.trim()) {
    return [config.webhookUrl.trim()];
  }
  return [''];
}

export function validateWebhookUrls(urls, webhookEnabled) {
  const hookOn = webhookEnabled === 1 || webhookEnabled === true;
  if (!hookOn) {
    return { ok: true, urls: [] };
  }
  const trimmed = (Array.isArray(urls) ? urls : [])
    .map((u) => String(u || '').trim())
    .filter(Boolean);
  if (trimmed.length === 0) return { ok: false, error: 'empty' };
  if (trimmed.length > MAX_WEBHOOK_URLS) return { ok: false, error: 'max' };
  for (const w of trimmed) {
    if (!/^https?:\/\//i.test(w)) {
      return { ok: false, error: 'invalid' };
    }
  }
  return { ok: true, urls: trimmed };
}

export function isAlertFlagOn(value) {
  return value === 1 || value === true || value === '1';
}

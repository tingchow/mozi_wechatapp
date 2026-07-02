import { request } from '../utils/request';
import { Interface } from '../utils/constants';
import { alertFrequencyToApi } from '../utils/alertConfig';

export const getAlertConfig = () => {
  return request({
    url: Interface.GET_ALERT_CONFIG,
    method: 'GET',
  });
};

export const fetchUserAlertConfig = async () => {
  try {
    const res = await getAlertConfig();
    if (res?.code === 0) return res.data || null;
    return null;
  } catch {
    return null;
  }
};

export const addAlertConfig = (params) => {
  return request({
    url: Interface.ADD_ALERT_CONFIG,
    method: 'POST',
    data: params,
  });
};

export const updateAlertConfig = (params) => {
  return request({
    url: Interface.UPDATE_ALERT_CONFIG,
    method: 'POST',
    data: params,
  });
};

export const createAlertConfig = async (config) => {
  const payload = {
    phoneEnabled: config.phoneEnabled,
    emailEnabled: config.emailEnabled,
    smsEnabled: config.smsEnabled,
    webhookEnabled: config.webhookEnabled || 0,
    webhookUrls: config.webhookUrls || [],
    alertFrequency: alertFrequencyToApi(config.alertFrequency),
  };
  if (config.alertPhone) {
    payload.alertPhone = config.alertPhone;
    payload.alertPhoneCountryCode = config.alertPhoneCountryCode || '+86';
  }
  if (config.alertEmail) payload.alertEmail = config.alertEmail;

  const res = await addAlertConfig(payload);
  if (res?.code === 0 && res.data) {
    return { success: true, data: res.data };
  }
  return { success: false, error: res?.errorMsg || res?.msg };
};

export const modifyAlertConfig = async (config) => {
  const payload = {
    phoneEnabled: config.phoneEnabled,
    emailEnabled: config.emailEnabled,
    smsEnabled: config.smsEnabled,
    webhookEnabled: config.webhookEnabled || 0,
    webhookUrls: config.webhookUrls || [],
    alertFrequency: alertFrequencyToApi(config.alertFrequency),
  };
  if (config.alertPhone) {
    payload.alertPhone = config.alertPhone;
    payload.alertPhoneCountryCode = config.alertPhoneCountryCode || '+86';
  }
  if (config.alertEmail) payload.alertEmail = config.alertEmail;

  const res = await updateAlertConfig(payload);
  if (res?.code === 0 && res.data) {
    return { success: true, data: res.data };
  }
  return { success: false, error: res?.errorMsg || res?.msg };
};

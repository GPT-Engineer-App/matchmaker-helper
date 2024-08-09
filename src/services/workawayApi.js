import axios from 'axios';

const WORKAWAY_API_BASE_URL = 'https://api.workaway.info/v1'; // Replace with actual Workaway API URL
const API_KEY = 'YOUR_WORKAWAY_API_KEY'; // Replace with your actual API key

const workawayApi = axios.create({
  baseURL: WORKAWAY_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const fetchHostProfile = async () => {
  const response = await workawayApi.get('/host/profile');
  return response.data;
};

export const updateHostProfile = async (profileData) => {
  const response = await workawayApi.put('/host/profile', profileData);
  return response.data;
};

export const fetchTravelers = async (filters) => {
  const response = await workawayApi.get('/travelers', { params: filters });
  return response.data;
};

export const sendMessage = async (travelerId, message) => {
  const response = await workawayApi.post('/messages', { travelerId, message });
  return response.data;
};

export const fetchReviews = async () => {
  const response = await workawayApi.get('/host/reviews');
  return response.data;
};

export const fetchMessageTemplates = async () => {
  const response = await workawayApi.get('/host/message-templates');
  return response.data;
};

export const saveMessageTemplate = async (template) => {
  const response = await workawayApi.post('/host/message-templates', template);
  return response.data;
};

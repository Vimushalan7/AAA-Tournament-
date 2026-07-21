const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tournament-backend-phi.vercel.app/api';

const getHeaders = async (customToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (customToken) {
    headers['Authorization'] = `Bearer ${customToken}`;
    return headers;
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async (endpoint, params = {}, customToken = null) => {
    let url = `${BASE_URL}${endpoint}`;
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    const headers = await getHeaders(customToken);
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  post: async (endpoint, body = {}, customToken = null) => {
    const headers = await getHeaders(customToken);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  put: async (endpoint, body = {}, customToken = null) => {
    const headers = await getHeaders(customToken);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  delete: async (endpoint, customToken = null) => {
    const headers = await getHeaders(customToken);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },
};

// Cloudinary upload helper
export const uploadToCloudinary = async (file) => {
  const cloudName = 'dvqiezk3i';
  const uploadPreset = 'ff_tournament';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  return data.secure_url;
};

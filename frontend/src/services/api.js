// RoutineMate API Client

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:8080/api'
    : '/api'
);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const message = data.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data.data !== undefined ? data.data : data;
};

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// Routine APIs
export const routineAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/routines`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getByDate: async (dateString) => {
    const res = await fetch(`${BASE_URL}/routines/date/${dateString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/routines/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  create: async (routineData) => {
    const res = await fetch(`${BASE_URL}/routines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(routineData)
    });
    return handleResponse(res);
  },

  update: async (id, routineData) => {
    const res = await fetch(`${BASE_URL}/routines/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(routineData)
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/routines/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markComplete: async (id, dateString) => {
    const url = dateString 
      ? `${BASE_URL}/routines/${id}/complete?date=${dateString}`
      : `${BASE_URL}/routines/${id}/complete`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markSkip: async (id, dateString) => {
    const url = dateString 
      ? `${BASE_URL}/routines/${id}/skip?date=${dateString}`
      : `${BASE_URL}/routines/${id}/skip`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markPending: async (id, dateString) => {
    const url = dateString 
      ? `${BASE_URL}/routines/${id}/pending?date=${dateString}`
      : `${BASE_URL}/routines/${id}/pending`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// Dashboard API
export const dashboardAPI = {
  getToday: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/today`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// Progress API
export const progressAPI = {
  getWeekly: async () => {
    const res = await fetch(`${BASE_URL}/progress/weekly`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// Notifications API
export const notificationAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markAsRead: async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markAllAsRead: async () => {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getUnreadCount: async () => {
    const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// Settings API
export const settingsAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/settings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateNotifications: async (prefDto) => {
    const res = await fetch(`${BASE_URL}/settings/notifications`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(prefDto)
    });
    return handleResponse(res);
  },

  updateProfile: async (profileDto) => {
    const res = await fetch(`${BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileDto)
    });
    return handleResponse(res);
  },

  changePassword: async (pwdDto) => {
    const res = await fetch(`${BASE_URL}/settings/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pwdDto)
    });
    return handleResponse(res);
  }
};

// Web Push API
export const pushAPI = {
  getPublicKey: async () => {
    const res = await fetch(`${BASE_URL}/push/public-key`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  subscribe: async (subscriptionData) => {
    const res = await fetch(`${BASE_URL}/push/subscribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subscriptionData)
    });
    return handleResponse(res);
  },

  unsubscribe: async (endpoint) => {
    const res = await fetch(`${BASE_URL}/push/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  sendTest: async () => {
    const res = await fetch(`${BASE_URL}/push/test`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

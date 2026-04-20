/**
 * API Configuration for Frontend
 * This file contains all the API endpoint configuration
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "mrrh_auth_token";

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    VERIFY: "/auth/verify",
  },

  // Assets
  ASSETS: {
    LIST: "/assets",
    GET: (id) => `/assets/${id}`,
    CREATE: "/assets",
    UPDATE: (id) => `/assets/${id}`,
    DELETE: (id) => `/assets/${id}`,
  },

  // Departments
  DEPARTMENTS: {
    LIST: "/departments",
    GET: (id) => `/departments/${id}`,
    CREATE: "/departments",
    UPDATE: (id) => `/departments/${id}`,
    DELETE: (id) => `/departments/${id}`,
  },

  // Users
  USERS: {
    LIST: "/users",
    PROFILES: "/users/profiles",
    GET: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`,
  },

  // Suppliers
  SUPPLIERS: {
    LIST: "/suppliers",
    GET: (id) => `/suppliers/${id}`,
    CREATE: "/suppliers",
    UPDATE: (id) => `/suppliers/${id}`,
    DELETE: (id) => `/suppliers/${id}`,
  },

  // Asset Assignments
  ASSIGNMENTS: {
    LIST: "/assignments",
    GET: (id) => `/assignments/${id}`,
    CREATE: "/assignments",
    UPDATE: (id) => `/assignments/${id}`,
    DELETE: (id) => `/assignments/${id}`,
  },

  // Maintenance
  MAINTENANCE: {
    LIST: "/maintenance",
    GET: (id) => `/maintenance/${id}`,
    CREATE: "/maintenance",
    UPDATE: (id) => `/maintenance/${id}`,
    DELETE: (id) => `/maintenance/${id}`,
  },

  // Fault Reports
  FAULT_REPORTS: {
    LIST: "/fault-reports",
    GET: (id) => `/fault-reports/${id}`,
    CREATE: "/fault-reports",
    UPDATE: (id) => `/fault-reports/${id}`,
    DELETE: (id) => `/fault-reports/${id}`,
  },

  // Asset Movements
  MOVEMENTS: {
    LIST: "/movements",
    GET: (id) => `/movements/${id}`,
    CREATE: "/movements",
    UPDATE: (id) => `/movements/${id}`,
    DELETE: (id) => `/movements/${id}`,
  },

  // Disposals
  DISPOSALS: {
    LIST: "/disposals",
    GET: (id) => `/disposals/${id}`,
    CREATE: "/disposals",
    UPDATE: (id) => `/disposals/${id}`,
    DELETE: (id) => `/disposals/${id}`,
  },

  // Asset categories
  ASSET_CATEGORIES: {
    LIST: "/asset-categories",
    GET: (id) => `/asset-categories/${id}`,
    CREATE: "/asset-categories",
    UPDATE: (id) => `/asset-categories/${id}`,
    DELETE: (id) => `/asset-categories/${id}`,
  },

  // Health Check
  HEALTH: "/health",
};

/**
 * Make API request with authentication
 */
export const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body: unknown = null,
  token: string | null = localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem("auth_token"),
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Specific API call functions
 */

// Auth
export const authAPI = {
  register: (data) => apiCall(API_ENDPOINTS.AUTH.REGISTER, "POST", data, null),
  login: (data) => apiCall(API_ENDPOINTS.AUTH.LOGIN, "POST", data, null),
  verify: () => apiCall(API_ENDPOINTS.AUTH.VERIFY, "GET"),
};

// Assets
export const assetsAPI = {
  getAll: () => apiCall(API_ENDPOINTS.ASSETS.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.ASSETS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.ASSETS.CREATE, "POST", data),
  update: (id, data) => apiCall(API_ENDPOINTS.ASSETS.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.ASSETS.DELETE(id), "DELETE"),
};

// Departments
export const departmentsAPI = {
  getAll: () => apiCall(API_ENDPOINTS.DEPARTMENTS.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.DEPARTMENTS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.DEPARTMENTS.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.DEPARTMENTS.DELETE(id), "DELETE"),
};

// Users
export const usersAPI = {
  getAll: () => apiCall(API_ENDPOINTS.USERS.LIST),
  getProfiles: () => apiCall(API_ENDPOINTS.USERS.PROFILES, "GET", null, null), // Public endpoint, no auth needed
  getById: (id) => apiCall(API_ENDPOINTS.USERS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.USERS.CREATE, "POST", data),
  update: (id, data) => apiCall(API_ENDPOINTS.USERS.UPDATE(id), "PUT", data),
  deactivate: (id) => apiCall(API_ENDPOINTS.USERS.DEACTIVATE(id), "PATCH"),
  delete: (id) => apiCall(API_ENDPOINTS.USERS.DELETE(id), "DELETE"),
};

// Suppliers
export const suppliersAPI = {
  getAll: () => apiCall(API_ENDPOINTS.SUPPLIERS.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.SUPPLIERS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.SUPPLIERS.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.SUPPLIERS.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.SUPPLIERS.DELETE(id), "DELETE"),
};

// Asset categories
export const assetCategoriesAPI = {
  getAll: () => apiCall(API_ENDPOINTS.ASSET_CATEGORIES.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.ASSET_CATEGORIES.GET(id)),
  create: (data) =>
    apiCall(API_ENDPOINTS.ASSET_CATEGORIES.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.ASSET_CATEGORIES.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.ASSET_CATEGORIES.DELETE(id), "DELETE"),
};

// Asset Assignments
export const assignmentsAPI = {
  getAll: () => apiCall(API_ENDPOINTS.ASSIGNMENTS.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.ASSIGNMENTS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.ASSIGNMENTS.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.ASSIGNMENTS.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.ASSIGNMENTS.DELETE(id), "DELETE"),
};

// Maintenance
export const maintenanceAPI = {
  getAll: () => apiCall(API_ENDPOINTS.MAINTENANCE.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.MAINTENANCE.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.MAINTENANCE.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.MAINTENANCE.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.MAINTENANCE.DELETE(id), "DELETE"),
};

// Fault Reports
export const faultReportsAPI = {
  getAll: () => apiCall(API_ENDPOINTS.FAULT_REPORTS.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.FAULT_REPORTS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.FAULT_REPORTS.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.FAULT_REPORTS.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.FAULT_REPORTS.DELETE(id), "DELETE"),
};

// Asset Movements
export const movementsAPI = {
  getAll: () => apiCall(API_ENDPOINTS.MOVEMENTS.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.MOVEMENTS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.MOVEMENTS.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.MOVEMENTS.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.MOVEMENTS.DELETE(id), "DELETE"),
};

// Disposals
export const disposalsAPI = {
  getAll: () => apiCall(API_ENDPOINTS.DISPOSALS.LIST),
  getById: (id) => apiCall(API_ENDPOINTS.DISPOSALS.GET(id)),
  create: (data) => apiCall(API_ENDPOINTS.DISPOSALS.CREATE, "POST", data),
  update: (id, data) =>
    apiCall(API_ENDPOINTS.DISPOSALS.UPDATE(id), "PUT", data),
  delete: (id) => apiCall(API_ENDPOINTS.DISPOSALS.DELETE(id), "DELETE"),
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  apiCall,
  authAPI,
  assetsAPI,
  departmentsAPI,
  usersAPI,
  suppliersAPI,
  assignmentsAPI,
  maintenanceAPI,
  faultReportsAPI,
  movementsAPI,
  disposalsAPI,
};

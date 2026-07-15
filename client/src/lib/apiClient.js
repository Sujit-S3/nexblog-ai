// Centralized API Client for NexBlog AI
// Solves 'Failed to fetch' by smartly routing requests via relative proxy in DEV mode or VITE_BACKEND_URL in PROD,
// enforcing credentials, setting JSON headers, handling request timeouts, and providing clear diagnostics.

const getBaseUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // In local development, relative calls ('/api/...') are intercepted cleanly by Vite's proxy (vite.config.js -> localhost:3000)
  // avoiding CORS or host mismatch issues between 127.0.0.1 and localhost.
  if (import.meta.env.DEV) {
    return '';
  }
  return backendUrl || '';
};

export const apiClient = async (endpoint, customConfig = {}) => {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const headers = { ...customConfig.headers };

  // Automatically set Content-Type if body is present and not FormData
  if (customConfig.body && !(customConfig.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    credentials: 'include',
    ...customConfig,
    headers,
  };

  // Implement 25-second timeout protection
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), customConfig.timeout || 25000);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Try parsing as JSON first
    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 25 seconds. Please check your connection.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to backend server. Please verify the API server is running.');
    }
    throw error;
  }
};

apiClient.get = (endpoint, config = {}) => apiClient(endpoint, { method: 'GET', ...config });

apiClient.post = (endpoint, body, config = {}) =>
  apiClient(endpoint, {
    method: 'POST',
    body: typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body,
    ...config,
  });

apiClient.put = (endpoint, body, config = {}) =>
  apiClient(endpoint, {
    method: 'PUT',
    body: typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body,
    ...config,
  });

apiClient.delete = (endpoint, config = {}) => apiClient(endpoint, { method: 'DELETE', ...config });

export default apiClient;

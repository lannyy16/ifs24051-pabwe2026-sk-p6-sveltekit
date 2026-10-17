
import {
  apiRequest,
  setToken,
  clearToken
} from '../../../lib/apiHelper';

export async function login(
  email: string,
  password: string
) {
  const response: any = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  const token = response?.data?.token || response?.token;

  if (token) {
    setToken(token);
  }

  const profile =
    response?.data?.user || response?.data?.profile;

  if (
    profile &&
    typeof localStorage !== 'undefined'
  ) {
    localStorage.setItem('profile', JSON.stringify(profile));
  }

  return response;
}

export async function register(
  name: string,
  email: string,
  password: string
) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export function logout() {
  clearToken();
}

export async function getProfile() {
  return apiRequest('/users/me');
}

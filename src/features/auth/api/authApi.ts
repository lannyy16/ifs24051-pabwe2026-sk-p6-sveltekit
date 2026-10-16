import { apiRequest, setToken, clearToken } from '../../../lib/apiHelper';
export async function login(email:string,password:string) { const r:any=await apiRequest('/auth/login',{method:'POST',body:JSON.stringify({email,password})}); const token=r?.data?.token||r?.token; if(token) setToken(token); const profile=r?.data?.user||r?.data?.profile; if(profile&&typeof localStorage!=='undefined') localStorage.setItem('profile',JSON.stringify(profile)); return r; }
export async function register(name:string,email:string,password:string) { return apiRequest('/auth/register',{method:'POST',body:JSON.stringify({name,email,password})}); }
export function logout(){clearToken();}
export async function getProfile(){return apiRequest('/users/me');}

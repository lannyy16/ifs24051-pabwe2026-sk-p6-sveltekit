import { apiRequest } from '../../../lib/apiHelper';
export const getMe=()=>apiRequest('/users/me');
export const updateMe=(data:Record<string,any>)=>apiRequest('/users/me',{method:'PUT',body:JSON.stringify(data)});
export const updatePhoto=(photo:File)=>{const f=new FormData();f.append('photo',photo);return apiRequest('/users/me/photo',{method:'POST',body:f});};
export const changePassword=(old_password:string,new_password:string)=>apiRequest('/users/me/password',{method:'PUT',body:JSON.stringify({old_password,new_password})});
export const listUsers=()=>apiRequest('/users');

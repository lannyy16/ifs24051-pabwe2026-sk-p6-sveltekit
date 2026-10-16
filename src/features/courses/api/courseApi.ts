import { apiRequest, queryString } from '../../../lib/apiHelper';
export const listCourses=(params:Record<string,any>={})=>apiRequest(`/courses${queryString(params)}`);
export const getCourse=(id:string|number)=>apiRequest(`/courses/${id}`);
export const createCourse=(title:string,description:string)=>apiRequest('/courses',{method:'POST',body:JSON.stringify({title,description})});
export const updateCourse=(id:string|number,title:string,description:string)=>apiRequest(`/courses/${id}`,{method:'PUT',body:JSON.stringify({title,description})});
export const deleteCourse=(id:string|number)=>apiRequest(`/courses/${id}`,{method:'DELETE'});
export const deleteAllCourses=()=>apiRequest('/courses',{method:'DELETE'});
export async function uploadCover(id:string|number,cover:File){const f=new FormData();f.append('cover',cover);return apiRequest(`/courses/${id}/cover`,{method:'POST',body:f});}
export const listParticipants=(id:string|number)=>apiRequest(`/courses/${id}/students`);
export const leaveCourse=(id:string|number)=>apiRequest(`/courses/${id}/leave`,{method:'DELETE'});
export const rateCourse=(id:string|number,rating:number)=>apiRequest(`/courses/${id}/rating`,{method:'POST',body:JSON.stringify({rating})});
export const createContent=(id:string|number,data:Record<string,any>)=>apiRequest(`/courses/${id}/contents`,{method:'POST',body:JSON.stringify(data)});
export const updateContent=(id:string|number,contentId:string|number,data:Record<string,any>)=>apiRequest(`/courses/${id}/contents/${contentId}`,{method:'PUT',body:JSON.stringify(data)});
export const getContent=(id:string|number)=>apiRequest(`/courses/-/contents/${id}`);
export const deleteContent=(id:string|number,contentId:string|number)=>apiRequest(`/courses/${id}/contents/${contentId}`,{method:'DELETE'});
export const setContentStatus=(id:string|number,contentId:string|number,is_completed:0|1)=>apiRequest(`/courses/${id}/contents/${contentId}/status`,{method:'PUT',body:JSON.stringify({is_completed})});

export type User = { id?: number|string; user_id?: number|string; name?: string; email?: string; photo?: string };
export type Course = { id: number|string; user_id?: number|string; title: string; description?: string; cover?: string; students?: Array<number|string|{id?:number|string;user_id?:number|string;name?:string}>; contents?: CourseContent[]; created_at?: string };
export type CourseContent = { id: number|string; title: string; description?: string; video_url?: string; youtube_url?: string; is_completed?: number|boolean };

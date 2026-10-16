import type { Course, CourseContent } from '../../../lib/types';
class CoursesStore { courses=$state<Course[]>([]); selected=$state<Course|null>(null); content=$state<CourseContent|null>(null); loading=$state(false); saving=$state(false); error=$state(''); setCourses(v:Course[]){this.courses=v;} setSelected(v:Course|null){this.selected=v;} setContent(v:CourseContent|null){this.content=v;} }
export const coursesStore = new CoursesStore();

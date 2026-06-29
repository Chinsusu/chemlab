import { phanUngTaoNuoc } from "@/lessons/data/phan-ung-tao-nuoc";
import { assertValidLesson } from "@/lessons/validate";

export const lessons = [assertValidLesson(phanUngTaoNuoc)];

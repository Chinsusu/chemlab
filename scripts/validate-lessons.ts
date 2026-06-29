import { lessons } from "../src/lessons";
import { validateLesson } from "../src/lessons/validate";

let hasError = false;

for (const lesson of lessons) {
  const errors = validateLesson(lesson);
  if (errors.length > 0) {
    hasError = true;
    console.error(`Lesson ${lesson.id} invalid:`);
    for (const error of errors) console.error(`- ${error}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`Validated ${lessons.length} lesson(s).`);

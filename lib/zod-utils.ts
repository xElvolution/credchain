import type { ZodError } from 'zod';

export interface FlattenedError {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

export function flattenZodError(err: ZodError): FlattenedError {
  const formErrors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    if (issue.path.length === 0) {
      formErrors.push(issue.message);
    } else {
      const key = String(issue.path[0]);
      (fieldErrors[key] ||= []).push(issue.message);
    }
  }
  return { formErrors, fieldErrors };
}

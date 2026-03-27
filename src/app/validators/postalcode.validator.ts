import { AbstractControl } from '@angular/forms';

export function ValidatePostalCode(control: AbstractControl): { invalidPostalCode: boolean } | null {
  const POSTAL_CODE_REGEXP = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]-\d[ABCEGHJ-NPRSTV-Z]\d$/i;
  return !POSTAL_CODE_REGEXP.test(control.value)
    ? { invalidPostalCode: true }
    : null;
}

/*export const validateSuggestion = (data) => {
  const errors = [];
  
  // التحقق من الاسم
  if (!data.name || data.name.trim().length < 3) {
    errors.push('اسم الشركة يجب أن يكون على الأقل 3 أحرف');
  }
  
  // التحقق من الوصف
  if (!data.description || data.description.trim().length < 20) {
    errors.push('الوصف يجب أن يكون على الأقل 20 حرفاً');
  }
  
  // التحقق من الموقع
  if (!data.location || data.location.trim().length < 3) {
    errors.push('الموقع يجب أن يكون على الأقل 3 أحرف');
  }
  
  // التحقق من رابط الموقع
  if (data.website && !isValidUrl(data.website)) {
    errors.push('الرابط الإلكتروني غير صالح');
  }
  
  return errors;
};

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
*/

// تعقيم ومنع إدخال أي HTML أو JavaScript
export function sanitizeInput(input) {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
}

// التحقق من الحقول النصية (ليس فارغًا بعد التعقيم)
export function validateText(input) {
  const sanitized = sanitizeInput(input.trim());
  return sanitized.length > 0 ? sanitized : null;
}

// التحقق من الروابط
export function validateURL(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

// utils/utils.js
export const getId = (obj) => {
  if (!obj) {
    console.warn('⚠️ getId called with null/undefined object');
    return null;
  }
  
  // Handle primitive types (string, number)
  if (typeof obj === 'string' || typeof obj === 'number') {
    return String(obj);
  }
  
  if (typeof obj !== 'object') {
    console.warn('⚠️ getId called with non-object:', typeof obj, obj);
    return null;
  }

  const idKeys = ['_id', 'id', 'userId', 'user_id', 'ID', 'objectId'];

  for (const key of idKeys) {
    const val = obj[key];
    if (val !== null && val !== undefined && val !== '') {
      const stringId = (typeof val === 'object' && val.toString) ? val.toString() : String(val);
      console.log(`✅ getId found ID: ${stringId} from property: ${key}`);
      return stringId;
    }
  }

  console.error('❌ getId: No valid ID found in object:', obj);
  console.error('❌ Available properties:', Object.keys(obj));
  return null;
};

export function safeJSONParse<T>(data: string, defaultData?: T) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return defaultData;
  }
}

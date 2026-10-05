export function database(env) {
  if (!env.DB) throw new Error('Database binding unavailable');
  return env.DB;
}
export const unpack = row => ({...JSON.parse(row.data), revision:row.revision});

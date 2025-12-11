import { createClient } from "@supabase/supabase-js";

let getCurrentUser = () => null;

export const setGetCurrentUser = (fn) => {
  getCurrentUser = fn;
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function writeLog(action, table, payload) {
  const user = getCurrentUser?.();

  await supabase.from("log_history").insert({
    action,
    message: JSON.stringify({
      table,
      payload
    }),
    created_by: user?.id || null
  });
}

export const supaClient = {
  async insert(table, data, toReturn = null, isSingle = false) {
    let query = supabase.from(table).insert(data);
    if (isSingle) query = query.single();
    if (toReturn) query = query.select(toReturn);
    const result = await query;
    await writeLog("INSERT", table, data);
    return result;
  },

  async update(table, match, data, toReturn = null, isSingle = false) {
    let query = supabase.from(table).update(data).match(match);
    if (isSingle) query = query.single();
    if (toReturn) query = query.select();
    const result = await query;
    await writeLog("UPDATE", table, { match, data });
    return result;
  },

  async select(table, query = "*", filters = null, isSingle = false) {
    let q = supabase.from(table).select(query);
    if (filters) q = q.match(filters);
    if (isSingle) q = q.single()
    const result = await q;
    await writeLog("SELECT", table, filters ?? "ALL");
    return result;
  },

  async delete(table, match) {
    const result = await supabase.from(table).delete().match(match);
    await writeLog("DELETE", table, match);
    return result;
  },

  async export(table) {
    const date = new Date().toISOString();
    await writeLog("EXPORT", table, `Export at ${date}`);
  }

};


export { supabase };


import { supabase } from '../supabaseClient';

export const DISPLAYFLAG = {
  HIDDEN:  1,
  READONLY: 2,
  REQUIRED: 4,
  TABLE: 8,
  PRINTABLE: 16,
  SCANNABLE: 32,
  CARD: 64
};

export const hasDisplayFlag = (display, flag) => (display & flag) === flag;

export const getDisplayFlags = (col) => ({
  hidden: hasDisplayFlag(col.display, DISPLAYFLAG.HIDDEN),
  readonly: hasDisplayFlag(col.display, DISPLAYFLAG.READONLY),
  required: hasDisplayFlag(col.display, DISPLAYFLAG.REQUIRED),
  table: hasDisplayFlag(col.display, DISPLAYFLAG.TABLE),
  printable: hasDisplayFlag(col.display, DISPLAYFLAG.PRINTABLE),
  scannable: hasDisplayFlag(col.display, DISPLAYFLAG.SCANNABLE),
});

export const processColumns = (columns) => {
  return columns.map((col) => ({
    ...col,
    displayFlags: getDisplayFlags(col),
  }));
};

export const getSettings = async (onChange) => {
  try {
    // initial fetch
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (error) {
      console.log(error);
      return null;
    }

    if (data?.columns?.values) {
      data.columns.values = processColumns(data.columns.values);
    }

    // subscribe to realtime updates
    const channel = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        (payload) => {
          console.log("Settings changed:", payload);

          if (payload.new?.columns?.values) {
            payload.new.columns.values = processColumns(
              payload.new.columns.values
            );
          }

          if (onChange) {
            onChange(payload.new);
          }
        }
      )
      .subscribe();

    return { data, unsubscribe: () => supabase.removeChannel(channel) };
  } catch (error) {
    console.log(error);
    return null;
  }
};

import supabase from "../config/supabaseClient.js";
import { TABLE_NAME } from "../consts/tableName.js";

export async function fetchDestinations() {
    const { data, error } = await supabase.from(TABLE_NAME.DESTINATIONS).select("*");
    if (error) throw new Error(error.message);
    return data;
}

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";
import { TABLE_NAME } from "../consts/tableName";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertData() {
    const data = JSON.parse(fs.readFileSync("expandedDestinations.json", "utf8"));

    for (const entry of data) {
        const { error } = await supabase
            .from(TABLE_NAME.DESTINATIONS)
            .insert({
                city: entry.city,
                country: entry.country,
                clues: entry.clues,
                fun_fact: entry.fun_fact,
                trivia: entry.trivia
            });

        if (error) {
            console.error("Error inserting:", entry.city, error);
        } else {
            console.log("Inserted:", entry.city);
        }
    }
}

insertData();

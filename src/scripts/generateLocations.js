import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const existingData = JSON.parse(fs.readFileSync("expandedDestinations.json", "utf8"));
const existingCities = new Set(existingData.map(item => item.city));

async function generateNewDestinations(count, existingCities) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const cityList = Array.from(existingCities).join(", ");
  
  const prompt = `
Generate a JSON array of ${count} unique, famous world destinations with the following structure:
[
  {
    "city": "London",
    "country": "United Kingdom",
    "clues": [
      "A city with a famous clock tower but no bell sound.",
      "Home to a royal family and the world's first underground metro."
    ],
    "fun_fact": [
      "Big Ben is actually the name of the bell, not the tower!",
      "London has over 170 museums."
    ],
    "trivia": [
      "London's underground is the oldest metro system in the world.",
      "It has more Indian restaurants than Mumbai."
    ]
  }
]

DO NOT include any of these cities that we already have: ${cityList}

Ensure the generated cities are diverse geographically and culturally.
Ensure the JSON format is valid.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function expandDestinations() {
  try {
    const targetTotal = 110; 
    const neededCount = targetTotal - existingData.length;
    
    if (neededCount <= 0) {
      console.log("Already have enough destinations!");
      return;
    }
    const batchSize = 30;
    const batches = Math.ceil(neededCount / batchSize);
    
    let allNewDestinations = [];
    
    for (let i = 0; i < batches; i++) {
      const count = Math.min(batchSize, neededCount - allNewDestinations.length);
      console.log(`Generating batch ${i+1} with ${count} destinations...`);
      const currentCities = new Set([
        ...existingCities,
        ...allNewDestinations.map(item => item.city)
      ]);
      
      const jsonText = await generateNewDestinations(count, currentCities);
      
      try {
        const jsonMatch = jsonText.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          const destinations = JSON.parse(jsonMatch[0]);
          allNewDestinations = [...allNewDestinations, ...destinations];
          console.log(`Added ${destinations.length} new destinations from batch ${i+1}`);
        } else {
          console.error(`No valid JSON found in batch ${i+1}`);
        }
      } catch (parseError) {
        console.error(`Error parsing JSON from batch ${i+1}:`, parseError);
        fs.writeFileSync(`error_batch_${i+1}.txt`, jsonText);
      }
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Appending with existing data
    const combinedDestinations = [...existingData, ...allNewDestinations];
    console.log(`Total destinations: ${combinedDestinations.length}`);
    
    // Save the combined data
    fs.writeFileSync("expandedDestinations.json", JSON.stringify(combinedDestinations, null, 2));
    console.log("All destination data generated and saved!");
  } catch (error) {
    console.error("Error expanding destinations:", error);
  }
}

expandDestinations();
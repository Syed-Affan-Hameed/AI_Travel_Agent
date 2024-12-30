import { Request, Response } from "express";
import { OpenAI } from "openai"; // Adjust the import based on your actual library
import dotenv from "dotenv";
import { newTools } from "../tools/tools";
import { getFlightData } from "../tools/tools";
//@ts-ignore
import Amadeus from "amadeus";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

let chatMessagesArray = [];
const SystemMessage = {
  role: "system",
  content:
    "You are a helpful AI travel agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers.if you get a lot of 'label:value' type of data then just give the answer in the form of a meaningful sentence.if you are presented with a list of flight details with pricing option then just give the best option as your output sentence(go for the cheapest one) also mention the seating class available.",
};
chatMessagesArray.push(SystemMessage);

export const planMyTrip = async (req: Request, res: Response) => {
  try {
    const query = req.body.userPrompt;

    chatMessagesArray.push({ role: "user", content: query });
    //@ts-ignore
    const runner = openai.beta.chat.completions.runTools({
        model: "gpt-4",
        messages: chatMessagesArray,
        tools: newTools,
      })
      .on("message", (message) => console.log(message));

    const finalContent = await runner.finalContent();

    chatMessagesArray.push({ role: "system", content: finalContent });

    console.log("ChatBot:", finalContent);

    res.status(200).json(finalContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchLocalFlightData = async (req: Request, res: Response) => {
    try {

        const flightDetails :{ budget :number ,originCity:string , destinationCity:string ,dateOfDeparture: string} = req.body;
        const resultFlightData = await getFlightData(flightDetails);
        res.status(200).json(resultFlightData);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
        
    }
  
}
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import travelAgentRouter from "./routes/travelAgent.routes";


dotenv.config();
const app = express();

const PORT = process.env.PORT || 5009;
//middleware to use json throughout our application
app.use(express.json());
// Define allowed origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5009", 
  ];
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const messages = [
    {
        role: "system",
        content: "You are a helpful AI travel agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers.Regarding the fligh"
    }
]
  // CORS Middleware
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
  
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS")); 
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
      credentials: true, 
      allowedHeaders: ["Content-Type", "Authorization"], 
    })
  );

  app.use("/api/v1/travelAgent",travelAgentRouter);
  
  app.listen(PORT,()=>{
    console.log("Server is running in the port "+ PORT);
  });

  app.get("/",(req,res)=>{
    res.send("Welcome to the server");
  });
import express  from "express";
import { planMyTrip } from "../controllers/travelAgent.controllers";

const travelAgentRouter = express.Router();


travelAgentRouter.post("/planMytrip", async (req, res, next) => {
    await planMyTrip(req, res);
});

export default travelAgentRouter;

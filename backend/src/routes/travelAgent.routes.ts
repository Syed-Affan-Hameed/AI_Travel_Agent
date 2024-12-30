import express  from "express";
import { planMyTrip,fetchLocalFlightData } from "../controllers/travelAgent.controllers";

const travelAgentRouter = express.Router();


travelAgentRouter.post("/planMytrip", async (req, res, next) => {
    await planMyTrip(req, res);
});
//This endpoint is for testing purposes.
travelAgentRouter.post("/fetchFlightData", async (req, res, next) => {
    await fetchLocalFlightData(req, res);
});

export default travelAgentRouter;

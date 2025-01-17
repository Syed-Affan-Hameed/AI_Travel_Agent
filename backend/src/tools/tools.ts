//@ts-ignore
import { amadeus } from "../controllers/travelAgent.controllers";
import { parse } from "date-fns/parse";
import axios from "axios";

interface CityCoordinates {
  lat: string;
  long: string;
}

enum subType {
  CITY = "CITY",
  AIRPORT = "AIRPORT",
}
interface Seating {
  cabin: string;
  class: string;
  fareBasis: string;
  brandedFare: string;
  brandedFareLabel: string;
  price: string;
}

interface SegmentDetails {
  departure: any;
  arrival: any;
  flightNumber: string;
  duration: string;
  carrierCode:string;
  seating: Seating[];
}

interface LimitedSegmentDetails {
    departureIataCode: string;
    arrivalIataCode: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    seating: string;
    airlineName: string;
  }

  interface limitedFlightsDetails {
    id: string;
    price: string;
    itineraries: { segments: LimitedSegmentDetails[] }[];
  }

  let carrierDictionary: any = {};
// The function gets the weather forecast for a given city for 5 days with data every 3 hours by geographic coordinates.
const getWeatherForecast = async (geoCodes: { lat: string; long: string }) => {
  const OpenWeatherApiKey = process.env.OPEN_WEATHER_API_KEY;
  const { lat, long } = geoCodes;
  //const dateStr = "27-12-2024";
  //const unixTime = getUnixTime(dateStr);
  //const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${long}&dt=${unixTime}&appid=${OpenWeatherApiKey}`;
  //const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${OpenWeatherApiKey}`;
  //current weather url
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${OpenWeatherApiKey}`;
  try {
    const response = await axios.get(url);
    console.log("raw api response", JSON.stringify(response.data, null, 2));
    const weatherForecast = response.data;
    return weatherForecast;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
  }
};

//Helper Functions for tools
//Unix time is needed if we ever change the weather API to a paid one that requires Unix time.
const getUnixTime = (dateString: string) => {
  const dateStr = dateString;
  const date = parse(dateStr, "dd-MM-yyyy", new Date());
  const unixTime = date.getTime();

  console.log(`Unix time for ${dateStr} is: ${unixTime}`);
  return unixTime;
};

const getCityCoordinates = async (cityNameObj: {
  cityName: string;
}): Promise<CityCoordinates | undefined> => {
  const cityName = cityNameObj.cityName;
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: cityName,
      subType: "CITY",
    });
    //console.log("raw api response", JSON.stringify(response));
    const cityDetails = response.data[0];
    const cityCoordinates: CityCoordinates = {
      lat: cityDetails.geoCode.latitude,
      long: cityDetails.geoCode.longitude,
    };
    console.log("City Coordinatesfrom endpoint :", cityCoordinates);
    return cityCoordinates;
  } catch (error) {
    console.error("Error fetching city coordinates:", error);
    return undefined;
  }
};

const getCityCoordinatess = async (cityName: string) => {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: cityName,
      subType: "CITY",
    });
    //console.log("raw api response", JSON.stringify(response));
    const cityDetails = response.data[0];
    return cityDetails;
  } catch (error) {
    console.error("Error fetching city coordinates:", error);
  }
};

const getIATACode = async (obj: {
  page: number;
  subType: subType;
  keyword: string;
}): Promise<string | undefined> => {
  try {
    const { page, subType, keyword } = obj;
    // API call with params we requested from client app
    const response = await amadeus.client.get("/v1/reference-data/locations", {
      keyword,
      subType,
      "page[limit]": page * 10,
      "page[offset]": (page - 1) * 10,
    });
    // Sending response for client
    try {
      //await res.json(JSON.parse(response.body));
      console.log(
        "Get IATA Code response",
        JSON.stringify(response.data, null, 2)
      );
    } catch (err: any) {
      console.log(
        "Get IATA Code Response Error Response",
        JSON.stringify(response.data, null, 2)
      );
    }
    const cityDetails = response.data;
    const cityCode = cityDetails[0].iataCode;
    return cityCode;
  } catch (error) {
    console.error("Error fetching city IATA code:", error);
  }
};

export const getFlightData = async (userFlightRequest: {
  noOfTravellers:number;
  budget: number;
  originCity: string;
  destinationCity: string;
  dateOfDeparture: string;
}) => {
  const originCity = userFlightRequest.originCity;
  const destinationCity = userFlightRequest.destinationCity;
  const noOfTravellers = userFlightRequest.noOfTravellers;

  const originCode = await getIATACode({
    page: 1,
    subType: subType.CITY,
    keyword: originCity,
  });
  const destinationCode = await getIATACode({
    page: 1,
    subType: subType.CITY,
    keyword: destinationCity,
  });
  const { budget, dateOfDeparture } = userFlightRequest;

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: dateOfDeparture,
      adults: noOfTravellers.toString(),
      max: "1",// increase for better recommendations
      currencyCode: "INR",
    });
    console.log("raw api response", JSON.stringify(response));
    const budgetInNumericals = budget;
    const flightDetails = extractFlightDetails(response, budgetInNumericals);
    const limitedFlightData = convertToLimitedFlightDetails(flightDetails);

    return limitedFlightData;
  } catch (error) {
    console.error("Error fetching flight data:", error);
  }
};

// Function to export the flight data without budget for test response
export const getTestFlightData = async (userFlightRequest: {
  budget: number;
  originCity: string;
  destinationCity: string;
  dateOfDeparture: string;
}) => {
  const originCity = userFlightRequest.originCity;
  const destinationCity = userFlightRequest.destinationCity;

  const originCode = await getIATACode({
    page: 1,
    subType: subType.CITY,
    keyword: originCity,
  });
  const destinationCode = await getIATACode({
    page: 1,
    subType: subType.CITY,
    keyword: destinationCity,
  });
  const { budget, dateOfDeparture } = userFlightRequest;

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: dateOfDeparture,
      adults: "1",
      max: "5",// increase for better recommendations
      currencyCode: "INR",
    });
    console.log("raw api response", JSON.stringify(response));
    const flightDetails = extractFlightDetailsWithoutBudget(response);
    const limitedFlightData = convertToLimitedFlightDetails(flightDetails);

    return limitedFlightData;
  } catch (error) {
    console.error("Error fetching flight data:", error);
  }
};


const extractFlightDetailsWithoutBudget =(data: any) => {
  const flightOffers = data.data;
  const result: any[] = [];

  flightOffers.forEach((offer: any) => {
    const offerDetails: {
      id: string;
      price: string;
      currency: string;
      itineraries: { segments: SegmentDetails[] }[];
    } = {
      id: offer.id,
      price: offer.price.total,
      currency: offer.price.currency,
      itineraries: [],
    };

    offer.itineraries.forEach((itinerary: any) => {
      const itineraryDetails = {
        segments: [] as SegmentDetails[],
      };

      itinerary.segments.forEach((segment: any) => {
        const segmentDetails: SegmentDetails = {
          departure: segment.departure,
          arrival: segment.arrival,
          flightNumber: segment.number,
          duration: segment.duration,
          carrierCode: segment.carrierCode,
          seating: [],
        };

        offer.travelerPricings.forEach((travelerPricing: any) => {
          travelerPricing.fareDetailsBySegment.forEach((fareDetail: any) => {
            if (fareDetail.segmentId === segment.id) {
              const seatPrice = parseFloat(travelerPricing.price.total);
              if (seatPrice) {
                segmentDetails.seating.push({
                  cabin: fareDetail.cabin,
                  class: fareDetail.class,
                  fareBasis: fareDetail.fareBasis,
                  brandedFare: fareDetail.brandedFare,
                  brandedFareLabel: fareDetail.brandedFareLabel,
                  price: travelerPricing.price.total,
                });
              }
            }
          });
        });

        if (segmentDetails.seating.length > 0) {
          itineraryDetails.segments.push(segmentDetails);
        }
      });

      if (itineraryDetails.segments.length > 0) {
        offerDetails.itineraries.push(itineraryDetails);
      }
    });

    if (offerDetails.itineraries.length > 0) {
      result.push(offerDetails);
    }
  });

  return result;
};

const convertToLimitedFlightDetails = (detailedFlightDetails: any[]): limitedFlightsDetails[] => {
    return detailedFlightDetails.map((flight) => {
      const limitedItineraries = flight.itineraries.map((itinerary: any) => {
        const limitedSegments = itinerary.segments.map((segment: any) => {
          const seating = segment.seating.map((seat: any) => seat.cabin).join(", ");
          const limitedSegmentDetails: LimitedSegmentDetails = {
            departureIataCode: segment.departure.iataCode,
            arrivalIataCode: segment.arrival.iataCode,
            departureTime: segment.departure.at,
            arrivalTime: segment.arrival.at,
            duration: segment.duration,
            seating: seating,
            airlineName: carrierDictionary[segment.carrierCode],
          }
          return limitedSegmentDetails;
        });

        return { segments: limitedSegments };
      });
  
      return {
        id: flight.id,
        price: flight.price,
        itineraries: limitedItineraries,
      };
    });
  };


const extractFlightDetails = (data: any, budget: number) => {
  const flightOffers = data.data;
  carrierDictionary = data.result.dictionaries.carriers;
  const result: any[] = [];

  flightOffers.forEach((offer: any) => {
    const offerDetails: {
      id: string;
      price: string;
      currency: string;
      itineraries: { segments: SegmentDetails[] }[];
    } = {
      id: offer.id,
      price: offer.price.total,
      currency: offer.price.currency,
      itineraries: [],
    };

    offer.itineraries.forEach((itinerary: any) => {
      const itineraryDetails = {
        segments: [] as SegmentDetails[],
      };

      itinerary.segments.forEach((segment: any) => {
        const segmentDetails: SegmentDetails = {
          carrierCode: segment.carrierCode,
          departure: segment.departure,
          arrival: segment.arrival,
          flightNumber: segment.number,
          duration: segment.duration,
          seating: [],
        };

        offer.travelerPricings.forEach((travelerPricing: any) => {
          travelerPricing.fareDetailsBySegment.forEach((fareDetail: any) => {
            if (fareDetail.segmentId === segment.id) {
              const seatPrice = parseFloat(travelerPricing.price.total);
              if(budget){
                if (seatPrice <= budget) {
                  segmentDetails.seating.push({
                    cabin: fareDetail.cabin,
                    class: fareDetail.class,
                    fareBasis: fareDetail.fareBasis,
                    brandedFare: fareDetail.brandedFare,
                    brandedFareLabel: fareDetail.brandedFareLabel,
                    price: travelerPricing.price.total,
                  });
                }
              }
              else{
                segmentDetails.seating.push({
                  cabin: fareDetail.cabin,
                  class: fareDetail.class,
                  fareBasis: fareDetail.fareBasis,
                  brandedFare: fareDetail.brandedFare,
                  brandedFareLabel: fareDetail.brandedFareLabel,
                  price: travelerPricing.price.total,
                });
              }
            }
          });
        });

        if (segmentDetails.seating.length > 0) {
          itineraryDetails.segments.push(segmentDetails);
        }
      });

      if (itineraryDetails.segments.length > 0) {
        offerDetails.itineraries.push(itineraryDetails);
      }
    });

    if (offerDetails.itineraries.length > 0) {
      result.push(offerDetails);
    }
  });

  return result;
};


//Tools for travel agent

export const newTools = [
    {
      type: "function",
      function: {
        function: getWeatherForecast,
        parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
        parameters: {
          type: "object",
          properties: {
            lat: { type: "string" },
            long: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        function: getCityCoordinates,
        parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
        parameters: {
          type: "object",
          properties: {
            cityName: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        function: getFlightData,
        parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
        parameters: {
          type: "object",
          properties: {
            noOfTravellers: { type: "number" , description: "Number of Travellers this should be inferred from the user prompt if not given explicitly" },
            budget: { type: "number",description: "User's Budget to Travel in INR(Indian Rupees)" },
            originCity: { type: "string" },
            destinationCity: { type: "string" },
            dateOfDeparture: { type: "string" ,description: "Date on which user wants to depart from the current city in the format YYYY-MM-DD for example:- '2025-01-01'"}
          }
        },
      },
    }
  ];
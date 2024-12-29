//@ts-ignore
import { amadeus } from "../controllers/travelAgent.controllers";
import { parse } from "date-fns/parse";
import axios from "axios";

interface CityCoordinates {
    lat:string,
    long:string
}

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

const getCityCoordinates = async (cityNameObj: { cityName: string }): Promise<CityCoordinates | undefined> => {
    const cityName  = cityNameObj.cityName;
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


  const getCityCoordinatess = async (cityName:string) => {
    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: cityName,
            subType: 'CITY'
        });
        //console.log("raw api response", JSON.stringify(response));
        const cityDetails = response.data[0];
        return cityDetails;
    } catch (error) {
        console.error('Error fetching city coordinates:', error);
    }
};


//Tools for travel agent

export const newTools   = [
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
];

export const getFlightData = async ( userFlightRequest:{ budget :number ,originCode:string , destinationCode:string ,dateOfDeparture: string}) => {
    const originCode = 'MEL';
    const destinationCode = 'JFK';
    const dateOfDeparture = '2024-12-30';
    const {budget} = userFlightRequest;

    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: originCode,
            destinationLocationCode: destinationCode,
            departureDate: dateOfDeparture,
            adults: '1',
            max: '1',
            currencyCode: 'INR'
        });
        console.log("raw api response", JSON.stringify(response));
        const budgetInNumericals = budget;
        const flightDetails = extractFlightDetails(response, budgetInNumericals);
        return flightDetails;
    } catch (error) {
        console.error('Error fetching flight data:', error);
    }
};

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
    carrierCode: string;
    flightNumber: string;
    duration: string;
    aircraft: string;
    seating: Seating[];
}

const extractFlightDetails = (data:any, budget:number) => {
    const flightOffers = data.data;
    const result:any[] = [];

    flightOffers.forEach((offer :any) => {
        const offerDetails: { id: string; price: string; currency: string; itineraries: { segments: SegmentDetails[] }[] } = {
            id: offer.id,
            price: offer.price.total,
            currency: offer.price.currency,
            itineraries: []
        };

        offer.itineraries.forEach((itinerary :any) => {
            const itineraryDetails = {
                segments: [] as SegmentDetails[]
            };

            itinerary.segments.forEach((segment:any) => {
                const segmentDetails: SegmentDetails = {
                    departure: segment.departure,
                    arrival: segment.arrival,
                    carrierCode: segment.carrierCode,
                    flightNumber: segment.number,
                    duration: segment.duration,
                    aircraft: segment.aircraft.code,
                    seating: []
                };

                offer.travelerPricings.forEach((travelerPricing:any) => {
                    travelerPricing.fareDetailsBySegment.forEach((fareDetail:any) => {
                        if (fareDetail.segmentId === segment.id) {
                            const seatPrice = parseFloat(travelerPricing.price.total);
                            if (seatPrice <= budget) {
                                segmentDetails.seating.push({
                                    cabin: fareDetail.cabin,
                                    class: fareDetail.class,
                                    fareBasis: fareDetail.fareBasis,
                                    brandedFare: fareDetail.brandedFare,
                                    brandedFareLabel: fareDetail.brandedFareLabel,
                                    price: travelerPricing.price.total
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
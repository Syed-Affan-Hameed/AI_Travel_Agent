# AI Travel Agent

This repository contains a full-stack AI Travel Agent application built with React, TypeScript, Vite, and Node.js. The backend uses OpenAI's GPT-4 model to provide travel recommendations, along with weather forecasts and travel clothing recommendations.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) 
- [Git](https://git-scm.com/)
- OpenAI API Key(Link: https://platform.openai.com/docs/overview).
- Amadeus API key and Secret(Refer this link: https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search )
- OpenWeather API (Link: https://openweathermap.org/current )

## Getting Started

Follow these steps to set up and run the application locally.

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/ai-travel-agent.git
cd ai-travel-agent
```

### 2. Navigate to the backend directory and install the dependencies:

```sh
cd backend
npm install
```
### 3. Create a .env file in the backend directory and add your API keys and other environment variables:

```sh
OPENAI_API_KEY=your_openai_api_key
AMADEUS_API_KEY =your_amadeus_api_key
AMADEUS_API_SECRET = your_amadeus_api_secret
OPEN_WEATHER_API_KEY = your_openweather_api_key
```
Start the backend server:

```sh
npm run dev
```
Start the frontend server:

```sh
npm install
npm run dev
```
### Contributing:
Contributions are welcome! Please open an issue or submit a pull request for any changes.

### License
This project is licensed under the MIT License.

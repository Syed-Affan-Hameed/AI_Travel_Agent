import React, { useState } from 'react'
import { Card } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { MinusCircle, PlusCircle, Plane } from 'lucide-react'
import axios from 'axios'

function App() {
  const [formData, setFormData] = useState({
    travelers: 1,
    flyingFrom: 'New York City',
    flyingTo: 'Paris',
    fromDate: '2023-11-24',
    toDate: '2023-12-05',
    budget: '$5000'
  })
  interface TripDetails {
    fromDate: string;
    toDate: string;
    flyingFrom: string;
    flyingTo: string;
    weather: string;
    flights: string;
    hotel: string;
  }

  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
  const [activeTab, setActiveTab] = useState('plan')

  const handleInputChange = (e :any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlanTrip = async () => {
    try {
      const response = await axios.post('https://api.example.com/plan-trip', formData)
      if(response.data){
        setTripDetails(response.data);
        console.log("Server response",response.data);
        
        setActiveTab('details')
      } else{
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error planning trip:', error)
      // Handle error (e.g., show error message to user)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan">Plan Trip</TabsTrigger>
            <TabsTrigger value="details" disabled={!tripDetails}>
              Trip Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Number of travellers</label>
              <div className="flex items-center justify-between rounded-full border p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="font-medium">{formData.travelers}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData(prev => ({ ...prev, travelers: prev.travelers + 1 }))}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Flying from</label>
              <Input 
                name="flyingFrom" 
                value={formData.flyingFrom} 
                onChange={handleInputChange} 
                className="rounded-full" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Flying to</label>
              <Input 
                name="flyingTo" 
                value={formData.flyingTo} 
                onChange={handleInputChange} 
                className="rounded-full" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">From Date</label>
              <Input 
                type="date" 
                name="fromDate" 
                value={formData.fromDate} 
                onChange={handleInputChange} 
                className="rounded-full" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">To Date</label>
              <Input 
                type="date" 
                name="toDate" 
                value={formData.toDate} 
                onChange={handleInputChange} 
                className="rounded-full" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Budget</label>
              <Input 
                name="budget" 
                value={formData.budget} 
                onChange={handleInputChange} 
                className="rounded-full" 
              />
            </div>

            <Button 
              className="w-full rounded-full bg-emerald-400 hover:bg-emerald-500" 
              onClick={handlePlanTrip}
            >
              Plan my Trip!
            </Button>
          </TabsContent>

          <TabsContent value="details" className="p-6 space-y-6">
            {tripDetails && (
              <>
                <div className="flex justify-between items-center">
                  <div className="bg-blue-100 rounded-full px-4 py-2 text-sm">
                    {tripDetails.fromDate}
                  </div>
                  <Plane className="h-4 w-4 text-blue-500" />
                  <div className="bg-blue-100 rounded-full px-4 py-2 text-sm">
                    {tripDetails.toDate}
                  </div>
                </div>

                <div className="bg-blue-100 rounded-full px-4 py-2 text-center">
                  {tripDetails.flyingFrom} → {tripDetails.flyingTo}
                </div>

                <Card className="p-4 space-y-2">
                  <h3 className="font-medium">Weather</h3>
                  <p className="text-sm text-gray-600">
                    {tripDetails.weather}
                  </p>
                </Card>

                <Card className="p-4 space-y-2">
                  <h3 className="font-medium">Flights</h3>
                  <p className="text-sm text-gray-600">
                    {tripDetails.flights}
                  </p>
                  <Button className="w-full rounded-full bg-emerald-400 hover:bg-emerald-500">
                    Book
                  </Button>
                </Card>

                <Card className="p-4 space-y-2">
                  <h3 className="font-medium">Hotel</h3>
                  <p className="text-sm text-gray-600">
                    {tripDetails.hotel}
                  </p>
                  <Button className="w-full rounded-full bg-emerald-400 hover:bg-emerald-500">
                    Book
                  </Button>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default App


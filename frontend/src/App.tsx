import React, { useState, useRef, useEffect } from 'react'
import { Card } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { MinusCircle, PlusCircle, Send } from 'lucide-react'
import axios from 'axios'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [formData, setFormData] = useState({
    travelers: 1,
    flyingFrom: '',
    flyingTo: '',
    fromDate: '2023-11-24',
    toDate: '2023-12-05',
    budget: ''
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState('plan')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlanTrip = async () => {
    setIsLoading(true)
    try {
      const planMyTripRequest = {
        userPrompt: `I want to plan a trip for ${formData.travelers} people from ${formData.flyingFrom} to ${formData.flyingTo} from ${formData.fromDate} to ${formData.toDate} with a budget of ${formData.budget}.`
      };
      const response = await axios.post('http://localhost:5009/api/v1/travelAgent/planMytrip', planMyTripRequest)
      setMessages([{ role: 'assistant', content: JSON.stringify(response.data) }])
      setActiveTab('details')
    } catch (error) {
      console.error('Error planning trip:', error)
      setMessages([{ role: 'assistant', content: 'Sorry, there was an error planning your trip. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return
console.log("Input:",input);
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const planMyTripRequest = {
        userPrompt: `${userMessage.content}`
            };
            console.log(`planMyTripRequest:   ${userMessage.content}  `,planMyTripRequest);
      const response = await axios.post('http://localhost:5009/api/v1/travelAgent/planMytrip', planMyTripRequest);
      console.log(response.data);
      const assistantMessage: Message = { role: 'assistant', content:  JSON.stringify(response.data) }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <h1 className="text-center text-3xl font-bold text-gray-800">AI Travel Agent</h1>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan">Plan Trip</TabsTrigger>
            <TabsTrigger value="details" disabled={messages.length === 0}>
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
                placeholder='Enter Origin City'
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Flying to</label>
              <Input 
                name="flyingTo" 
                value={formData.flyingTo} 
                onChange={handleInputChange} 
                className="rounded-full" 
                 placeholder='Enter Destination City'
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
                placeholder='Enter Budget in ₹'
              />
            </div>

            <Button 
              className="w-full rounded-full bg-emerald-400 hover:bg-emerald-500" 
              onClick={handlePlanTrip}
              disabled={isLoading}
            >
              {isLoading ? 'Planning...' : 'Plan my Trip!'}
            </Button>
          </TabsContent>

          <TabsContent value="details" className="p-6">
            <div className="space-y-4 h-[400px] overflow-y-auto mb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start space-x-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                      AI
                    </div>
                  )}
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'bg-emerald-100' : 'bg-blue-100'} rounded-lg p-4`}>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                      U
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center space-x-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your trip..." 
                className="flex-1 rounded-full"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                size="icon" 
                className="rounded-full"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
    </>
  )
}

export default App


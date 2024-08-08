import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { UserCircle, Send, RefreshCw, LogOut, Save, Calendar, MapPin, Globe, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";

const API_URL = 'http://localhost:3000/api'; // Replace with your actual API URL

const fetchProfile = async () => {
  const response = await fetch(`${API_URL}/profile`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

const updateProfile = async (profile) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

const fetchTravelers = async () => {
  const response = await fetch(`${API_URL}/travelers`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch travelers');
  return response.json();
};

const sendMessage = async ({ travelerId, message }) => {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ travelerId, message }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

const fetchMessageTemplates = async () => {
  const response = await fetch(`${API_URL}/message-templates`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch message templates');
  return response.json();
};

const saveMessageTemplate = async (template) => {
  const response = await fetch(`${API_URL}/message-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error('Failed to save message template');
  return response.json();
};

const fetchReviews = async () => {
  const response = await fetch(`${API_URL}/reviews`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
};

const Index = () => {
  const { user, logout, notifications, addNotification } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const mockFetchNotifications = () => {
        const newNotification = { id: Date.now(), message: "You have a new traveler interested in your project!" };
        addNotification(newNotification);
      };
      mockFetchNotifications();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [addNotification]);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast({ title: "Profile Updated", description: "Your host profile has been successfully updated." });
    },
  });

  const { data: travelers, isLoading: isTravelersLoading, refetch: refetchTravelers } = useQuery({
    queryKey: ['travelers'],
    queryFn: fetchTravelers,
  });

  const { data: messageTemplates, isLoading: isTemplatesLoading } = useQuery({
    queryKey: ['messageTemplates'],
    queryFn: fetchMessageTemplates,
  });

  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
  });

  const saveTemplateMutation = useMutation({
    mutationFn: saveMessageTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['messageTemplates']);
      toast({ title: "Template Saved", description: "Your message template has been saved." });
      setTemplateName('');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['travelers']);
      toast({ title: "Message Sent", description: "Your message has been sent to the traveler." });
      setMessageText('');
    },
  });

  if (isProfileLoading || isTravelersLoading || isTemplatesLoading || isReviewsLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="w-[250px] h-[20px] rounded-full mb-6" />
        <Skeleton className="w-full h-[300px] rounded-md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workaway Host Dashboard</h1>
        <Button onClick={logout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Host Profile</TabsTrigger>
          <TabsTrigger value="travelers">Potential Travelers</TabsTrigger>
          <TabsTrigger value="messages">Messages & Templates</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Host Profile</CardTitle>
              <CardDescription>Update your profile to attract suitable travelers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea 
                  id="projectDescription" 
                  value={profile.projectDescription} 
                  onChange={(e) => updateProfileMutation.mutate({ ...profile, projectDescription: e.target.value })}
                  placeholder="Describe your project and what you're looking for in a traveler"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={profile.location} 
                  onChange={(e) => updateProfileMutation.mutate({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpNeeded">Type of Help Needed</Label>
                <Input 
                  id="helpNeeded" 
                  value={profile.helpNeeded} 
                  onChange={(e) => updateProfileMutation.mutate({ ...profile, helpNeeded: e.target.value })}
                  placeholder="e.g., Gardening, Teaching, Construction"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accommodation">Accommodation Details</Label>
                <Textarea 
                  id="accommodation" 
                  value={profile.accommodation} 
                  onChange={(e) => updateProfileMutation.mutate({ ...profile, accommodation: e.target.value })}
                  placeholder="Describe the accommodation you provide"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages Spoken</Label>
                <Input 
                  id="languages" 
                  value={profile.languages} 
                  onChange={(e) => updateProfileMutation.mutate({ ...profile, languages: e.target.value })}
                  placeholder="e.g., English, Spanish, French"
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>
              <div className="space-y-2">
                <Label>Available Dates</Label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="travelers">
          <Card>
            <CardHeader>
              <CardTitle>Potential Travelers</CardTitle>
              <CardDescription>Find and contact suitable travelers for your project</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetchTravelers()} className="mb-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Travelers
              </Button>
              <div className="space-y-4">
                {travelers.map((traveler) => (
                  <Card key={traveler.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UserCircle className="mr-2 h-6 w-6" />
                        {traveler.name}
                      </CardTitle>
                      <CardDescription>
                        Skills: {traveler.skills.map(skill => (
                          <Badge key={skill} variant="secondary" className="mr-1">{skill}</Badge>
                        ))}
                        <br />
                        Available: {traveler.availability}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Type your message here..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="mb-2"
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        onClick={() => sendMessageMutation.mutate({ travelerId: traveler.id, message: messageText })}
                        disabled={!messageText.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Create and manage your message templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateContent">Template Content</Label>
                  <Textarea
                    id="templateContent"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter your message template here"
                  />
                </div>
                <Button onClick={() => saveTemplateMutation.mutate({ name: templateName, content: messageText })}>
                  <Save className="mr-2 h-4 w-4" /> Save Template
                </Button>
                <div className="mt-4">
                  <Label>Saved Templates</Label>
                  <Select onValueChange={(value) => setMessageText(messageTemplates.find(t => t.id === value).content)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTemplates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>See what travelers have said about their experience with you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="mr-2 h-5 w-5 text-yellow-400" />
                        {review.rating} / 5
                      </CardTitle>
                      <CardDescription>
                        By {review.travelerName} on {new Date(review.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-md shadow-lg">
          <h3 className="font-bold mb-2">Notifications</h3>
          {notifications.map((notification) => (
            <div key={notification.id} className="mb-2">
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;

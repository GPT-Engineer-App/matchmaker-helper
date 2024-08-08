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
import { UserCircle, Send, RefreshCw, LogOut, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const fetchCandidates = async () => {
  const response = await fetch(`${API_URL}/candidates`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch candidates');
  return response.json();
};

const sendMessage = async ({ candidateId, message }) => {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ candidateId, message }),
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

const Index = () => {
  const { user, logout, notifications, addNotification } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [templateName, setTemplateName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for new notifications every 30 seconds
    const intervalId = setInterval(() => {
      // This is a mock function. In a real app, you'd fetch notifications from the server
      const mockFetchNotifications = () => {
        const newNotification = { id: Date.now(), message: "You have a new match!" };
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
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    },
  });

  const { data: candidates, isLoading: isCandidatesLoading, refetch: refetchCandidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: fetchCandidates,
  });

  const { data: messageTemplates, isLoading: isTemplatesLoading } = useQuery({
    queryKey: ['messageTemplates'],
    queryFn: fetchMessageTemplates,
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
      queryClient.invalidateQueries(['candidates']);
      toast({ title: "Message Sent", description: "Your message has been sent to the candidate." });
      setMessageText('');
    },
  });

  if (isProfileLoading || isCandidatesLoading || isTemplatesLoading) {
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
        <h1 className="text-3xl font-bold">Workaway Automation Tool</h1>
        <Button onClick={logout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Your Profile</TabsTrigger>
          <TabsTrigger value="candidates">Potential Matches</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Workaway Profile</CardTitle>
              <CardDescription>Update your profile information to find better matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={profile.name} 
                  onChange={(e) => updateProfileMutation.mutate({ ...profile, name: e.target.value })}
                  aria-label="Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" name="skills" value={profile.skills} onChange={(e) => updateProfileMutation.mutate({ ...profile, skills: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" name="availability" value={profile.availability} onChange={(e) => updateProfileMutation.mutate({ ...profile, availability: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferences</Label>
                <Textarea id="preferences" name="preferences" value={profile.preferences} onChange={(e) => updateProfileMutation.mutate({ ...profile, preferences: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Potential Matches</CardTitle>
              <CardDescription>Find and contact suitable candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetchCandidates()} className="mb-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Candidates
              </Button>
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <Card key={candidate.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UserCircle className="mr-2 h-6 w-6" />
                        {candidate.name}
                      </CardTitle>
                      <CardDescription>
                        Skills: {candidate.skills}<br />
                        Availability: {candidate.availability}
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
                        onClick={() => sendMessageMutation.mutate({ candidateId: candidate.id, message: messageText })}
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
        
        <TabsContent value="templates">
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

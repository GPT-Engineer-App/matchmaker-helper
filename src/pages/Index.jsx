import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { UserCircle, Send, RefreshCw, LogOut } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

const Index = () => {
  const { user, logout } = useAuth();
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
      toast({ title: "Message Sent", description: "Your message has been sent to the candidate." });
      setMessageText('');
    },
  });

  if (isProfileLoading || isCandidatesLoading) {
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
      </Tabs>
    </div>
  );
};

export default Index;

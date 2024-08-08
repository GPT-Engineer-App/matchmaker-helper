import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { UserCircle, Send, RefreshCw } from "lucide-react";

const Index = () => {
  const [profile, setProfile] = useState({
    name: '',
    skills: '',
    availability: '',
    preferences: '',
  });
  const [candidates, setCandidates] = useState([]);
  const { toast } = useToast();

  const handleProfileUpdate = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const fetchCandidates = () => {
    // Simulating API call to fetch candidates
    const mockCandidates = [
      { id: 1, name: 'Alice', skills: 'Gardening, Cooking', availability: 'June-August', lastContacted: null },
      { id: 2, name: 'Bob', skills: 'Carpentry, Teaching', availability: 'July-September', lastContacted: '2023-05-01' },
      { id: 3, name: 'Charlie', skills: 'Web Development, Photography', availability: 'August-October', lastContacted: null },
    ];
    setCandidates(mockCandidates);
    toast({
      title: "Candidates Fetched",
      description: `Found ${mockCandidates.length} potential matches.`,
    });
  };

  const sendMessage = (candidateId) => {
    // Simulating sending a message
    setCandidates(candidates.map(c => 
      c.id === candidateId ? {...c, lastContacted: new Date().toISOString().split('T')[0]} : c
    ));
    toast({
      title: "Message Sent",
      description: "Your personalized message has been sent to the candidate.",
    });
  };

  const sendReminder = (candidateId) => {
    // Simulating sending a reminder
    toast({
      title: "Reminder Sent",
      description: "A reminder has been sent to the candidate.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Workaway Automation Tool</h1>
      
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
                <Input id="name" name="name" value={profile.name} onChange={handleProfileUpdate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" name="skills" value={profile.skills} onChange={handleProfileUpdate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" name="availability" value={profile.availability} onChange={handleProfileUpdate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferences</Label>
                <Textarea id="preferences" name="preferences" value={profile.preferences} onChange={handleProfileUpdate} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast({ title: "Profile Updated", description: "Your profile has been successfully updated." })}>
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Potential Matches</CardTitle>
              <CardDescription>Find and contact suitable candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchCandidates} className="mb-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Fetch Candidates
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
                    <CardFooter className="flex justify-between">
                      <Button onClick={() => sendMessage(candidate.id)} disabled={candidate.lastContacted}>
                        <Send className="mr-2 h-4 w-4" />
                        {candidate.lastContacted ? 'Message Sent' : 'Send Message'}
                      </Button>
                      {candidate.lastContacted && (
                        <Button variant="outline" onClick={() => sendReminder(candidate.id)}>
                          Send Reminder
                        </Button>
                      )}
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

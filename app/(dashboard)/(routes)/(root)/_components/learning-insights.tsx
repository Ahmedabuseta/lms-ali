'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Clock, Calendar, ChevronRight, Award, LineChart, BrainCircuit } from 'lucide-react';
import { showNotification } from '@/components/ui/notifications';

interface LearningInsightsProps {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  studyStreak: number;
  recentActivity: {
    type: string;
    title: string;
    date: string;
    progress?: number;
  }[];
  recommendedCourses: {
    id: string;
    title: string;
    category: string;
  }[];
}

export function LearningInsights({
  totalCourses,
  completedCourses,
  totalHours,
  studyStreak,
  recentActivity,
  recommendedCourses
}: LearningInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const overallProgress = Math.round((completedCourses / totalCourses) * 100) || 0;
  
  const handleNotification = () => {
    showNotification.achievement(
      'Study Milestone Reached!', 
      `You've studied for ${totalHours} hours. Keep up the great work!`,
      { duration: 8000 }
    );
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-muted/50 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Your Learning Journey
        </CardTitle>
        <CardDescription>
          Track your progress, stay motivated, and achieve your learning goals
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 py-2 border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="text-sm">Recent Activity</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-sm">Recommendations</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="m-0 p-0">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 p-4 rounded-md bg-slate-50 dark:bg-slate-900 border">
              <div className="flex justify-between">
                <div className="text-muted-foreground text-sm">Course Progress</div>
                <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                  {overallProgress}%
                </div>
              </div>
              <div className="text-2xl font-semibold">{completedCourses}/{totalCourses}</div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-md bg-slate-50 dark:bg-slate-900 border">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Learning</div>
                <div className="text-2xl font-semibold">{totalHours} hrs</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-md bg-slate-50 dark:bg-slate-900 border">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Study Streak</div>
                <div className="text-2xl font-semibold">{studyStreak} days</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-md bg-slate-50 dark:bg-slate-900 border">
              <div className="rounded-full bg-violet-100 dark:bg-violet-900/20 p-2">
                <Award className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Achievements</div>
                <div className="text-2xl font-semibold">3 new</div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t bg-muted/20">
            <Button variant="outline" size="sm" className="ml-auto" onClick={handleNotification}>
              <LineChart className="mr-2 h-4 w-4" />
              View detailed stats
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="activity" className="m-0 p-0">
          <CardContent className="p-4 space-y-4">
            <div className="text-sm font-medium mb-2">Your recent activities</div>
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0">
                <div className={`rounded-full p-2 ${
                  activity.type === 'course' ? 'bg-blue-100 dark:bg-blue-900/20' : 
                  activity.type === 'exam' ? 'bg-amber-100 dark:bg-amber-900/20' : 
                  'bg-green-100 dark:bg-green-900/20'
                }`}>
                  {activity.type === 'course' ? (
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : activity.type === 'exam' ? (
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{activity.title}</div>
                  <div className="text-xs text-muted-foreground">{activity.date}</div>
                  {activity.progress !== undefined && (
                    <Progress value={activity.progress} className="h-1.5 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t bg-muted/20">
            <Button variant="outline" size="sm" className="ml-auto">
              View all activities
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="recommendations" className="m-0 p-0">
          <CardContent className="p-4 space-y-4">
            <div className="text-sm font-medium mb-2">Recommended for you</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="rounded-md border p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                  <div className="text-sm font-medium">{course.title}</div>
                  <div className="text-xs text-muted-foreground">{course.category}</div>
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" className="h-8">
                      View course
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t bg-muted/20">
            <Button variant="outline" size="sm" className="ml-auto">
              Browse all courses
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
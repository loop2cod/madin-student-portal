"use client"

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Users, 
  UserCheck, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { useWhatsApp } from "@/hooks/useWhatsApp";

interface DashboardStats {
  totalContacts: number;
  totalStudents: number;
  totalStaff: number;
  activeConversations: number;
  unreadConversations: number;
  todayMessages: number;
}

interface WhatsAppDashboardProps {
  onContactSelect?: (contactId: string) => void;
}

const WhatsAppDashboard: React.FC<WhatsAppDashboardProps> = ({ onContactSelect }) => {
  const { dashboardStats, getDashboardStats, loading } = useWhatsApp();

  useEffect(() => {
    getDashboardStats();
  }, [getDashboardStats]);

  const stats = dashboardStats || {
    totalContacts: 0,
    totalStudents: 0,
    totalStaff: 0,
    activeConversations: 0,
    unreadConversations: 0,
    todayMessages: 0
  };

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      changeColor: "text-green-600"
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: UserCheck,
      color: "bg-green-500",
      change: "+8%",
      changeColor: "text-green-600"
    },
    {
      title: "Active Chats",
      value: stats.activeConversations,
      icon: MessageCircle,
      color: "bg-purple-500",
      change: "+15%",
      changeColor: "text-green-600"
    },
    {
      title: "Unread Messages",
      value: stats.unreadConversations,
      icon: MessageSquare,
      color: "bg-orange-500",
      change: "-5%",
      changeColor: "text-red-600"
    },
    {
      title: "Today's Messages",
      value: stats.todayMessages,
      icon: TrendingUp,
      color: "bg-indigo-500",
      change: "+23%",
      changeColor: "text-green-600"
    },
    {
      title: "Staff Contacts",
      value: stats.totalStaff,
      icon: Users,
      color: "bg-teal-500",
      change: "+3%",
      changeColor: "text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Dashboard</h1>
          <p className="text-gray-600">Monitor your WhatsApp communications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={stat.changeColor}>{stat.change}</span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New message from John Doe</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <Badge variant="secondary">Student</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Message sent to Jane Smith</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <Badge variant="outline">Staff</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New contact added</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <Badge variant="secondary">System</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Messages Sent Today</span>
                <span className="font-semibold">{stats.todayMessages}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="font-semibold text-green-600">85%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="font-semibold">12 min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Replies</span>
                <span className="font-semibold text-orange-600">{stats.unreadConversations}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppDashboard;
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

const notifications = [
  {
    id: 1,
    title: 'Application Approved',
    message: 'Congratulations! Your admission application has been approved. Please proceed with the fee payment.',
    type: 'success',
    date: '2 hours ago',
    read: false,
    icon: CheckCircle
  },
  {
    id: 2,
    title: 'Fee Payment Reminder',
    message: 'Your admission fee payment is due in 5 days. Please complete the payment to secure your seat.',
    type: 'warning',
    date: '1 day ago',
    read: false,
    icon: AlertTriangle
  },
  {
    id: 3,
    title: 'Document Upload Required',
    message: 'Please upload your Class 12 mark sheet and transfer certificate to complete your admission process.',
    type: 'info',
    date: '2 days ago',
    read: true,
    icon: Info
  },
  {
    id: 4,
    title: 'Profile Updated Successfully',
    message: 'Your profile information has been updated successfully. All changes have been saved.',
    type: 'success',
    date: '3 days ago',
    read: true,
    icon: CheckCircle
  },
  {
    id: 5,
    title: 'Welcome to MADIN',
    message: 'Welcome to MADIN College of Engineering & Management. Your student account has been created successfully.',
    type: 'info',
    date: '5 days ago',
    read: true,
    icon: Info
  }
];

export default function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout 
      title="Notifications"
      breadcrumbs={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "Notifications" }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Notifications</h1>
              <p className="text-purple-100">
                Stay updated with important announcements and updates
              </p>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              <Bell className="w-4 h-4 mr-2" />
              {unreadCount} Unread
            </Badge>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            
            return (
              <Card 
                key={notification.id} 
                className={`${getNotificationStyle(notification.type)} border-l-4 ${!notification.read ? 'ring-2 ring-blue-100' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100' : notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                      <IconComponent className={`w-5 h-5 ${getIconColor(notification.type)}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                              New
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">{notification.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{notification.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Email Notifications:</strong> You will receive important notifications via email at your registered email address.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Notification Types:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Application Status Updates</li>
                    <li>• Fee Payment Reminders</li>
                    <li>• Document Requirements</li>
                    <li>• Academic Announcements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Delivery Methods:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• In-app notifications</li>
                    <li>• Email notifications</li>
                    <li>• SMS for urgent updates</li>
                    <li>• Dashboard alerts</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
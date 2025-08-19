'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock,
  MapPin,
  Send
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

const faqs = [
  {
    id: 1,
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking on 'Forgot Password' on the login page, or contact the IT support team."
  },
  {
    id: 2,
    question: "When will I receive my admission documents?",
    answer: "Admission documents are typically processed within 3-5 business days after fee payment confirmation."
  },
  {
    id: 3,
    question: "How can I update my personal information?",
    answer: "You can update your personal information through the 'My Profile' section in your dashboard."
  },
  {
    id: 4,
    question: "What documents do I need to submit?",
    answer: "Required documents include Class 12 mark sheet, transfer certificate, and passport-size photographs."
  }
];

export default function SupportPage() {
  return (
    <DashboardLayout 
      title="Help & Support"
      breadcrumbs={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "Help & Support" }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Help & Support</h1>
              <p className="text-yellow-100">
                Get assistance with your queries and technical issues
              </p>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              <Clock className="w-4 h-4 mr-2" />
              24/7 Support
            </Badge>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
              <div className="space-y-2">
                <p className="font-semibold">+91 9876543210</p>
                <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us your queries via email</p>
              <div className="space-y-2">
                <p className="font-semibold">support@madin.edu</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Visit Campus</h3>
              <p className="text-gray-600 mb-4">Meet us in person at our campus</p>
              <div className="space-y-2">
                <p className="font-semibold">MADIN Campus</p>
                <p className="text-sm text-gray-500">Mon-Sat, 9 AM - 5 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Send us a Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your full name" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your query" />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue or query in detail..."
                  rows={5}
                />
              </div>
              
              <Button className="w-full md:w-auto">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-lg mb-2">{faq.question}</h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Emergency Contact</h3>
                <p className="text-red-700">
                  For urgent matters outside office hours, call: <strong>+91 9876543211</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
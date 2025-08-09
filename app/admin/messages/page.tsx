"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageCircle, Search, Eye, Reply, MoreHorizontal, Mail, Clock, AlertCircle } from "lucide-react"

interface Message {
  _id: string
  id: string
  customerName: string
  customerEmail: string
  subject: string
  message: string
  status: "new" | "read" | "replied" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  response?: string
  respondedAt?: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [responseText, setResponseText] = useState("")

  // Sample messages data
  const sampleMessages: Message[] = [
    {
      _id: "1",
      id: "MSG001",
      customerName: "Arjun Sharma",
      customerEmail: "arjun.sharma@email.com",
      subject: "Question about product quality",
      message: "Hi, I wanted to know more about the quality of your premium almonds. Are they really organic certified?",
      status: "new",
      priority: "medium",
      createdAt: "2024-08-09T10:30:00Z"
    },
    {
      _id: "2",
      id: "MSG002",
      customerName: "Priya Patel",
      customerEmail: "priya.patel@email.com",
      subject: "Delivery delay complaint",
      message: "My order #ORD123 was supposed to be delivered yesterday but I haven't received it yet. Can you please check?",
      status: "read",
      priority: "high",
      createdAt: "2024-08-08T15:45:00Z"
    },
    {
      _id: "3",
      id: "MSG003",
      customerName: "Rajesh Kumar",
      customerEmail: "rajesh.kumar@email.com",
      subject: "Bulk order inquiry",
      message: "I'm interested in placing a bulk order for my restaurant. Can you provide wholesale pricing for 50kg of mixed dry fruits?",
      status: "replied",
      priority: "high",
      createdAt: "2024-08-07T09:15:00Z",
      response: "Thank you for your inquiry! We'll be happy to provide wholesale pricing. Our sales team will contact you within 24 hours.",
      respondedAt: "2024-08-07T14:30:00Z"
    },
    {
      _id: "4",
      id: "MSG004",
      customerName: "Anita Singh",
      customerEmail: "anita.singh@email.com",
      subject: "Thank you message",
      message: "Just wanted to thank you for the excellent quality of products. The dates were absolutely fresh and delicious!",
      status: "closed",
      priority: "low",
      createdAt: "2024-08-06T11:20:00Z",
      response: "Thank you so much for your kind words! We're delighted that you enjoyed our products.",
      respondedAt: "2024-08-06T16:45:00Z"
    },
    {
      _id: "5",
      id: "MSG005",
      customerName: "Vikram Mehta",
      customerEmail: "vikram.mehta@email.com",
      subject: "Product recommendation request",
      message: "I'm new to dry fruits. Can you recommend a starter pack for someone who wants to try different varieties?",
      status: "new",
      priority: "low",
      createdAt: "2024-08-05T14:10:00Z"
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMessages(sampleMessages)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    const matchesPriority = priorityFilter === "all" || message.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800"
      case "read": return "bg-yellow-100 text-yellow-800"
      case "replied": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-orange-100 text-orange-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message)
    setShowMessageDialog(true)
    
    // Mark as read if it's new
    if (message.status === "new") {
      setMessages(prev => prev.map(m => 
        m._id === message._id ? { ...m, status: "read" } : m
      ))
    }
  }

  const handleSendResponse = () => {
    if (!selectedMessage || !responseText.trim()) return

    const updatedMessage = {
      ...selectedMessage,
      status: "replied" as const,
      response: responseText,
      respondedAt: new Date().toISOString()
    }

    setMessages(prev => prev.map(m => 
      m._id === selectedMessage._id ? updatedMessage : m
    ))

    setSelectedMessage(updatedMessage)
    setResponseText("")
  }

  const stats = [
    {
      title: "Total Messages",
      value: messages.length,
      icon: MessageCircle,
      color: "text-[#355E3B]"
    },
    {
      title: "New Messages",
      value: messages.filter(m => m.status === "new").length,
      icon: Mail,
      color: "text-blue-600"
    },
    {
      title: "Pending Response",
      value: messages.filter(m => m.status === "read").length,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "High Priority",
      value: messages.filter(m => m.priority === "high").length,
      icon: AlertCircle,
      color: "text-red-600"
    }
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#355E3B]">Message Center</h1>
            <p className="text-gray-600 mt-1">Manage customer inquiries and support requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-[#355E3B]">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                <Input
                  placeholder="Search messages by customer name, subject, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#355E3B] flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages ({filteredMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message._id}>
                    <TableCell className="font-medium">{message.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{message.customerName}</div>
                        <div className="text-sm text-gray-600">{message.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{message.subject}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View & Reply
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#355E3B]">Message Details - {selectedMessage?.id}</DialogTitle>
            <DialogDescription>Customer inquiry and response management</DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Customer Information</h3>
                <p><strong>Name:</strong> {selectedMessage.customerName}</p>
                <p><strong>Email:</strong> {selectedMessage.customerEmail}</p>
                <p><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                  <Badge className={getPriorityColor(selectedMessage.priority)}>
                    {selectedMessage.priority}
                  </Badge>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <h3 className="font-medium mb-2">Subject: {selectedMessage.subject}</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Previous Response */}
              {selectedMessage.response && (
                <div>
                  <h3 className="font-medium mb-2">Your Response</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.response}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Sent on {new Date(selectedMessage.respondedAt!).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Response Form */}
              <div>
                <h3 className="font-medium mb-2">
                  {selectedMessage.response ? "Send Follow-up Response" : "Send Response"}
                </h3>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response here..."
                  className="mb-4"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendResponse}
                    disabled={!responseText.trim()}
                    className="bg-[#355E3B] hover:bg-[#2A4A2F]"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Send Response
                  </Button>
                  <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

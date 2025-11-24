import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Message } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, RotateCcw, Eye, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function MessageHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, refetch } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("DELETE", `/api/messages/${messageId}`);
    },
    onSuccess: () => {
      toast({
        title: "Message deleted",
        description: "The message has been removed from your history.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Resend message mutation
  const resendMutation = useMutation({
    mutationFn: async (message: Message) => {
      const response = await apiRequest("POST", "/api/messages/send", {
        recipientPhone: message.recipientPhone,
        recipientName: message.recipientName,
        content: message.content,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message resent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Copy message content to clipboard
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleResend = (message: Message) => {
    resendMutation.mutate(message);
  };

  const handleDelete = (messageId: string) => {
    deleteMutation.mutate(messageId);
  };

  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message);
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = searchTerm === "" || 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientPhone.includes(searchTerm) ||
      (message.recipientName && message.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Delivered
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-messages"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      {searchTerm || statusFilter !== "all" ? "No messages match your filters" : "No messages sent yet"}
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-accent" data-testid={`row-message-${message.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-foreground" data-testid={`text-recipient-name-${message.id}`}>
                            {message.recipientName || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-recipient-phone-${message.id}`}>
                            {message.recipientPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground truncate max-w-xs" data-testid={`text-message-content-${message.id}`}>
                          {message.content}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-testid={`status-message-${message.id}`}>
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" data-testid={`text-sent-time-${message.id}`}>
                        {message.sentAt ? formatDistanceToNow(new Date(message.sentAt), { addSuffix: true }) : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" data-testid={`text-cost-${message.id}`}>
                        ${message.cost || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResend(message)}
                            disabled={resendMutation.isPending}
                            title="Resend message"
                            data-testid={`button-resend-${message.id}`}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            title="Copy message content"
                            data-testid={`button-copy-${message.id}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewDetails(message)}
                                title="View details"
                                data-testid={`button-view-details-${message.id}`}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Message Details</DialogTitle>
                              </DialogHeader>
                              {selectedMessage && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Recipient</label>
                                    <p className="text-sm">{selectedMessage.recipientName || "Unknown"}</p>
                                    <p className="text-sm text-muted-foreground">{selectedMessage.recipientPhone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Message</label>
                                    <p className="text-sm border rounded-md p-2 bg-muted">{selectedMessage.content}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Sent At</label>
                                    <p className="text-sm">{selectedMessage.sentAt ? new Date(selectedMessage.sentAt).toLocaleString() : "N/A"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Cost</label>
                                    <p className="text-sm">${selectedMessage.cost || "0.00"}</p>
                                  </div>
                                  {selectedMessage.textbeltId && (
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Textbelt ID</label>
                                      <p className="text-sm font-mono">{selectedMessage.textbeltId}</p>
                                    </div>
                                  )}
                                  {selectedMessage.errorMessage && (
                                    <div>
                                      <label className="text-sm font-medium text-red-600">Error</label>
                                      <p className="text-sm text-red-600">{selectedMessage.errorMessage}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(message.id)}
                            disabled={deleteMutation.isPending}
                            title="Delete message"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            data-testid={`button-delete-${message.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination placeholder */}
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                Showing {filteredMessages.length} messages
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled data-testid="button-previous-page">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled data-testid="button-next-page">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

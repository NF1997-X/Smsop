import { apiRequest } from "./queryClient";
import { type InsertContact, type InsertMessage, type UpdateSettings } from "@shared/schema";

export const api = {
  // Contacts
  contacts: {
    getAll: () => fetch("/api/contacts").then(res => res.json()),
    create: (data: InsertContact) => apiRequest("POST", "/api/contacts", data),
    update: (id: string, data: Partial<InsertContact>) => apiRequest("PATCH", `/api/contacts/${id}`, data),
    delete: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),
  },

  // Messages
  messages: {
    getAll: () => fetch("/api/messages").then(res => res.json()),
    send: (data: InsertMessage) => apiRequest("POST", "/api/messages/send", data),
  },

  // Settings
  settings: {
    get: () => fetch("/api/settings").then(res => res.json()),
    update: (data: UpdateSettings) => apiRequest("POST", "/api/settings", data),
    test: (data: { apiKey: string; apiEndpoint: string }) => apiRequest("POST", "/api/settings/test", data),
  },
};

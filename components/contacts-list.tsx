"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Scan, Search, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useContacts } from "@/hooks/use-contacts"
import type { Contact } from "@/types/contact"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ContactsList() {
  const router = useRouter()
  const { contacts, addContact } = useContacts()
  const [searchQuery, setSearchQuery] = useState("")
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
    metAt: "",
    date: new Date().toISOString(),
  })
  const [isAddingContact, setIsAddingContact] = useState(false)

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddContact = () => {
    if (newContact.name) {
      addContact({
        id: Date.now().toString(),
        ...(newContact as Contact),
      })
      setNewContact({
        name: "",
        title: "",
        company: "",
        email: "",
        phone: "",
        notes: "",
        metAt: "",
        date: new Date().toISOString(),
      })
      setIsAddingContact(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewContact((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Contacts</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAddingContact(true)}
            aria-label="Add Contact Manually"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" onClick={() => router.push("/scan")} aria-label="Scan QR Code">
            <Scan className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search contacts..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        {filteredContacts.length > 0 ? (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4" onClick={() => router.push(`/contact/${contact.id}`)}>
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    {contact.title && contact.company && (
                      <p className="text-sm text-muted-foreground">
                        {contact.title} at {contact.company}
                      </p>
                    )}
                    {contact.metAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Met at {contact.metAt} on {new Date(contact.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">No contacts found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Add contacts by scanning QR codes or manually"}
            </p>
          </div>
        )}
      </ScrollArea>

      <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={newContact.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={newContact.title}
                onChange={handleInputChange}
                placeholder="Software Engineer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={newContact.company}
                onChange={handleInputChange}
                placeholder="Acme Inc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newContact.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={newContact.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metAt">Met At</Label>
              <Input
                id="metAt"
                name="metAt"
                value={newContact.metAt}
                onChange={handleInputChange}
                placeholder="TechConf 2023"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={newContact.notes}
                onChange={handleInputChange}
                placeholder="We discussed collaboration opportunities..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingContact(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={!newContact.name}>
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

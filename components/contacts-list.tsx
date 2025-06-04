"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Scan, Search, UserPlus, SortAsc, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useContacts } from "@/hooks/use-contacts"
import type { Contact } from "@/types/contact"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import InfiniteScroll from "react-infinite-scroll-component"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 20

export default function ContactsList() {
  const router = useRouter()
  const { contacts, addContact, deleteContact } = useContacts()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "company">("date")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isAddingContact, setIsAddingContact] = useState(false)
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

  const filteredContacts = contacts
    .filter(
      (contact) =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "company":
          return (a.company || "").localeCompare(b.company || "")
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

  const displayedContacts = filteredContacts.slice(0, page * ITEMS_PER_PAGE)
  const hasMore = displayedContacts.length < filteredContacts.length

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
      toast.success("Contact added successfully!")
    }
  }

  const handleDeleteSelected = () => {
    selectedContacts.forEach((id) => deleteContact(id))
    setSelectedContacts([])
    toast.success(`${selectedContacts.length} contact(s) deleted`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewContact((prev) => ({ ...prev, [name]: value }))
  }

  const toggleContactSelection = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">My Contacts</h2>
        <div className="flex gap-2">
          {selectedContacts.length > 0 && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDeleteSelected}
              aria-label="Delete Selected"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-[140px]">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Added</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <InfiniteScroll
          dataLength={displayedContacts.length}
          next={() => setPage((p) => p + 1)}
          hasMore={hasMore}
          loader={<div className="text-center py-4">Loading...</div>}
          scrollableTarget="scrollableDiv"
        >
          <AnimatePresence>
            {displayedContacts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {displayedContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                        selectedContacts.includes(contact.id) ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleContactSelection(contact.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                          <div className="flex-1" onClick={() => router.push(`/contact/${contact.id}`)}>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{contact.name}</h3>
                            {contact.title && contact.company && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {contact.title} at {contact.company}
                              </p>
                            )}
                            {contact.metAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Met at {contact.metAt} on {new Date(contact.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-gray-600 dark:text-gray-300">No contacts found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? "Try a different search term" : "Add contacts by scanning QR codes or manually"}
                </p>
              </div>
            )}
          </AnimatePresence>
        </InfiniteScroll>
      </ScrollArea>

      <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                placeholder="TechConf 2024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={newContact.notes}
                onChange={handleInputChange}
                placeholder="Add any notes about this contact..."
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
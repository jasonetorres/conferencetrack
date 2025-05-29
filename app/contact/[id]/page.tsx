"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Building, Briefcase } from "lucide-react"
import { ContactsProvider, useContacts } from "@/hooks/use-contacts"
import type { Contact } from "@/types/contact"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function ContactDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { contacts, updateContact, deleteContact } = useContacts()
  const [contact, setContact] = useState<Contact | null>(null)
  const [editedContact, setEditedContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const foundContact = contacts.find((c) => c.id === params.id)
    if (foundContact) {
      setContact(foundContact)
      setEditedContact(foundContact)
    } else {
      router.push("/")
    }
  }, [contacts, params.id, router])

  if (!contact) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <p>Loading...</p>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedContact((prev) => {
      if (!prev) return null
      return { ...prev, [name]: value }
    })
  }

  const handleSave = () => {
    if (editedContact) {
      updateContact(editedContact)
      setContact(editedContact)
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    deleteContact(contact.id)
    router.push("/")
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Contact Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit contact">
            <Pencil className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" aria-label="Delete contact">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Contact</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete {contact.name}? This action cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{contact.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(contact.title || contact.company) && (
            <div className="flex items-start gap-2">
              {contact.title && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.title}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.company}</span>
                </div>
              )}
            </div>
          )}

          <Separator />

          {(contact.email || contact.phone) && (
            <div className="space-y-2">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {contact.socials && Object.keys(contact.socials).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Social Media</h3>
                {Object.entries(contact.socials).map(([platform, url]) => (
                  <div key={platform} className="flex items-center gap-2">
                    <span className="text-sm capitalize">{platform}:</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}

          {contact.metAt && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium">Met At</h3>
                <p className="text-sm">
                  {contact.metAt} on {new Date(contact.date).toLocaleDateString()}
                </p>
              </div>
            </>
          )}

          {contact.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {editedContact && (
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={editedContact.name}
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
                  value={editedContact.title || ""}
                  onChange={handleInputChange}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={editedContact.company || ""}
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
                  value={editedContact.email || ""}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={editedContact.phone || ""}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metAt">Met At</Label>
                <Input
                  id="metAt"
                  name="metAt"
                  value={editedContact.metAt || ""}
                  onChange={handleInputChange}
                  placeholder="TechConf 2023"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={editedContact.notes || ""}
                  onChange={handleInputChange}
                  placeholder="We discussed collaboration opportunities..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  return (
    <ContactsProvider>
      <ContactDetailContent params={params} />
    </ContactsProvider>
  )
}

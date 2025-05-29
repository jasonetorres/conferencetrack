export interface Contact {
  id: string
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  notes?: string
  metAt?: string
  date: string
  socials?: Record<string, string>
}

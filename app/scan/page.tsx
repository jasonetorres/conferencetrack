"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Camera } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { Contact } from "@/types/contact"
import { ContactsProvider, useContacts } from "@/hooks/use-contacts"

function ScanPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { addContact } = useContacts()
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Check if the browser supports the camera API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser doesn't support camera access")
        return
      }

      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream
      setCameraPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
        startScanning()
      }
    } catch (err) {
      console.error("Camera error:", err)
      setCameraPermission(false)
      setError("Camera permission denied or not available")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
  }

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(() => {
      scanFrame()
    }, 500) // Scan every 500ms
  }

  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      // Get image data from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Try to detect QR code using a simple approach
      // For now, we'll use a manual input as fallback
      // In a real implementation, you'd use a QR detection library here
    } catch (err) {
      console.error("Scan error:", err)
    }
  }

  const handleManualInput = () => {
    const input = prompt("Enter QR code data manually (for testing):")
    if (input) {
      handleQrDetected(input)
    }
  }

  const handleQrDetected = (data: string) => {
    if (!data || data.trim() === "") {
      return
    }

    setScanResult(data)
    setIsScanning(false)

    try {
      const parsedData = parseQrData(data)
      if (parsedData && parsedData.name) {
        const newContact: Contact = {
          id: Date.now().toString(),
          name: parsedData.name,
          title: parsedData.title,
          company: parsedData.company,
          email: parsedData.email,
          phone: parsedData.phone,
          socials: parsedData.socials,
          notes: parsedData.notes || "Added via QR code scan",
          metAt: parsedData.metAt || "QR Code Scan",
          date: new Date().toISOString(),
        }

        addContact(newContact)
        stopCamera()
        router.push(`/contact/${newContact.id}`)
      } else {
        setError("Could not extract contact information from QR code")
      }
    } catch (err) {
      console.error("Parse error:", err)
      setError("Could not parse QR code data")
    }
  }

  const parseQrData = (data: string): Partial<Contact> | null => {
    if (!data || typeof data !== "string") {
      return null
    }

    console.log("Scanning QR data:", data)

    // First priority: Check if it's a vCard format
    if (data.startsWith("BEGIN:VCARD")) {
      return parseVCard(data)
    }

    // Second priority: Try to parse as JSON (legacy format)
    try {
      if (data.trim().startsWith("{") && data.trim().endsWith("}")) {
        const jsonData = JSON.parse(data)
        if (jsonData && jsonData.name) {
          return {
            name: jsonData.name,
            title: jsonData.title || undefined,
            company: jsonData.company || undefined,
            email: jsonData.email || undefined,
            phone: jsonData.phone || undefined,
            socials: jsonData.socials || undefined,
            metAt: "QR Code Scan",
            notes: "Contact information from QR code",
          }
        }
      }
    } catch (e) {
      console.log("Not valid JSON, trying other formats")
    }

    // Third priority: Check if it's a LinkedIn URL
    if (data.includes("linkedin.com/in/")) {
      const username = data.split("linkedin.com/in/")[1].split(/[/?#]/)[0]
      return {
        name: `LinkedIn: ${username}`,
        notes: `LinkedIn profile: ${data}`,
        socials: { linkedin: data },
        metAt: "QR Code Scan",
      }
    }

    // Fourth priority: Check if it's any social media URL
    if (data.startsWith("http")) {
      let platform = "Website"
      let name = "Web Contact"

      if (data.includes("twitter.com") || data.includes("x.com")) {
        platform = "Twitter/X"
        name = "Twitter Contact"
      } else if (data.includes("instagram.com")) {
        platform = "Instagram"
        name = "Instagram Contact"
      } else if (data.includes("facebook.com")) {
        platform = "Facebook"
        name = "Facebook Contact"
      }

      return {
        name: name,
        notes: `${platform} profile: ${data}`,
        socials: { [platform.toLowerCase()]: data },
        metAt: "QR Code Scan",
      }
    }

    // Last priority: Plain text
    if (data.trim().length > 0) {
      return {
        name: "Text Contact",
        notes: data,
        metAt: "QR Code Scan",
      }
    }

    return null
  }

  const parseVCard = (vcard: string): Partial<Contact> => {
    if (!vcard || typeof vcard !== "string") {
      return {}
    }

    const lines = vcard.split("\n").map((line) => line.trim())
    const contact: Partial<Contact> = {
      metAt: "QR Code Scan",
      notes: "Contact from vCard",
      socials: {},
    }

    lines.forEach((line) => {
      if (!line || line === "BEGIN:VCARD" || line === "END:VCARD" || line.startsWith("VERSION:")) {
        return
      }

      const colonIndex = line.indexOf(":")
      if (colonIndex === -1) return

      const key = line.substring(0, colonIndex)
      const value = line.substring(colonIndex + 1)

      if (!value) return

      switch (key) {
        case "FN":
          contact.name = value
          break
        case "TITLE":
          contact.title = value
          break
        case "ORG":
          contact.company = value
          break
        case "EMAIL":
          contact.email = value
          break
        case "TEL":
          contact.phone = value
          break
        case "NOTE":
          contact.notes = value
          break
        default:
          if (key.startsWith("URL")) {
            const typeMatch = key.match(/type=([^;]+)/)
            const platform = typeMatch ? typeMatch[1] : "website"
            if (!contact.socials) contact.socials = {}
            contact.socials[platform] = value
          }
          break
      }
    })

    return contact
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Scan QR Code</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center p-4">
              <p className="text-red-500 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => setError(null)} variant="outline" className="w-full">
                  Try Again
                </Button>
                <Button onClick={() => router.push("/")} className="w-full">
                  Go Back
                </Button>
              </div>
            </div>
          ) : cameraPermission === false ? (
            <div className="text-center p-4">
              <p className="mb-4">Please enable camera access to scan QR codes</p>
              <Button onClick={() => router.push("/")}>Go Back</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg bg-black">
                <video ref={videoRef} className="w-full h-64 object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-50"></div>
                </div>

                {isScanning && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Scanning...
                  </div>
                )}
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Position the QR code within the frame to scan and add the contact
              </p>

              {/* Manual input for testing */}
              <Button onClick={handleManualInput} variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Manual Input (for testing)
              </Button>

              {scanResult && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Last scanned:</p>
                  <p className="text-xs text-muted-foreground truncate">{scanResult}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => router.push("/")} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default function ScanPage() {
  return (
    <ContactsProvider>
      <ScanPageContent />
    </ContactsProvider>
  )
}

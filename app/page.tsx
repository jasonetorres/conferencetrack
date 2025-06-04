"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QrCodeGenerator from "@/components/qr-code-generator"
import ContactsList from "@/components/contacts-list"
import ProfileSettings from "@/components/profile-settings"
import HomeScreenInstructions from "@/components/home-screen-instructions"
import { UserMenu } from "@/components/user-menu"
import { ContactsProvider } from "@/hooks/use-contacts"
import { ProfileProvider } from "@/hooks/use-profile"
import { QrSettingsProvider } from "@/hooks/use-qr-settings"

export default function Home() {
  return (
    <ProtectedRoute>
      <ProfileProvider>
        <ContactsProvider>
          <QrSettingsProvider>
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Conference Contact Tracker
                  </h1>
                  <UserMenu />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <Tabs defaultValue="myqr" className="w-full">
                    <TabsList className="w-full border-b border-gray-200 dark:border-gray-700">
                      <TabsTrigger value="myqr" className="flex-1 py-4">My QR</TabsTrigger>
                      <TabsTrigger value="contacts" className="flex-1 py-4">Contacts</TabsTrigger>
                      <TabsTrigger value="profile" className="flex-1 py-4">Profile</TabsTrigger>
                    </TabsList>

                    <div className="p-6">
                      <TabsContent value="myqr">
                        <QrCodeGenerator />
                      </TabsContent>

                      <TabsContent value="contacts">
                        <ContactsList />
                      </TabsContent>

                      <TabsContent value="profile" className="space-y-8">
                        <ProfileSettings />
                        <HomeScreenInstructions />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </main>
          </QrSettingsProvider>
        </ContactsProvider>
      </ProfileProvider>
    </ProtectedRoute>
  )
}
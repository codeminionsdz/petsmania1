"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Store, Truck, CreditCard, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface Settings {
  free_shipping_threshold: number
  default_shipping_cost: number
  processing_time_days: number
  enable_free_shipping: boolean
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true)
      const response = await fetch("/api/admin/settings")
      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleSettingChange = async (key: keyof Settings, value: any) => {
    if (!settings) return

    try {
      const response = await fetch("/api/admin/settings/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          value,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to update setting",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setSettings({
        ...settings,
        [key]: value,
      })

      toast({
        title: "Success",
        description: `Setting updated successfully`,
      })
    } catch (error) {
      console.error("Error updating setting:", error)
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      })
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({ title: "Settings saved", description: "Your settings have been updated successfully." })
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your store settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Store information managed by administrator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    Store information such as name, description, contact details, and address are managed directly by the administrator and cannot be edited here.
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Store Name:</span>
                      <p className="text-muted-foreground">Parapharmacie l'Olivier</p>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground">Premium parapharmacy products delivered across Algeria</p>
                    </div>
                    <div>
                      <span className="font-medium">Contact Email:</span>
                      <p className="text-muted-foreground">Parapharmacielolivier@gmail.com</p>
                    </div>
                    <div>
                      <span className="font-medium">Contact Phone:</span>
                      <p className="text-muted-foreground">+213770867403</p>
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>
                      <p className="text-muted-foreground">04 rue la zitouna soukahras 41000 Souk Ahras, Algeria</p>
                    </div>
                    <div>
                      <span className="font-medium">Instagram:</span>
                      <a href="https://www.instagram.com/parapharmacie_de_lolivier?igsh=MWZmOGNhMHRyeWJmNw==" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        @parapharmacie_de_lolivier
                      </a>
                    </div>
                    <div>
                      <span className="font-medium">Facebook:</span>
                      <a href="https://www.facebook.com/share/16msr2HLCG/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Parapharmacie l'Olivier
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>Configure shipping options and rates</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div className="text-center py-8">Loading settings...</div>
              ) : settings ? (
                <div className="space-y-6">
                  {/* Enable Free Shipping Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-sm text-muted-foreground">
                        Enable free shipping above a certain amount
                      </p>
                    </div>
                    <Switch
                      checked={settings.enable_free_shipping}
                      onCheckedChange={(value) =>
                        handleSettingChange("enable_free_shipping", value)
                      }
                    />
                  </div>

                  {/* Conditional Fields - Only show if Free Shipping is Enabled */}
                  {settings.enable_free_shipping && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="freeShippingThreshold">
                          Free Shipping Threshold (DZD)
                        </Label>
                        <Input
                          id="freeShippingThreshold"
                          type="number"
                          value={settings.free_shipping_threshold}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              free_shipping_threshold: Number(e.target.value),
                            })
                          }}
                          onBlur={() => {
                            handleSettingChange(
                              "free_shipping_threshold",
                              settings.free_shipping_threshold
                            )
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Customers get free shipping when order total is above this amount
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultShipping">
                          Default Shipping Cost (DZD)
                        </Label>
                        <Input
                          id="defaultShipping"
                          type="number"
                          value={settings.default_shipping_cost}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              default_shipping_cost: Number(e.target.value),
                            })
                          }}
                          onBlur={() => {
                            handleSettingChange(
                              "default_shipping_cost",
                              settings.default_shipping_cost
                            )
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Shipping cost applied when order is below the threshold
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Processing Time - Always Visible */}
                  <div className={settings.enable_free_shipping ? "border-t pt-4 space-y-2" : "space-y-2"}>
                    <Label htmlFor="processingTime">Processing Time (days)</Label>
                    <Input
                      id="processingTime"
                      type="number"
                      value={settings.processing_time_days}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          processing_time_days: Number(e.target.value),
                        })
                      }}
                      onBlur={() => {
                        handleSettingChange(
                          "processing_time_days",
                          settings.processing_time_days
                        )
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      How many days to process an order
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-red-500">Failed to load settings</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure accepted payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cash on Delivery (COD)</p>
                  <p className="text-sm text-muted-foreground">Allow customers to pay when they receive their order</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">CCP / Baridi Mob</p>
                  <p className="text-sm text-muted-foreground">Accept bank transfers via Algérie Poste</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">EDAHABIA Card</p>
                  <p className="text-sm text-muted-foreground">Accept EDAHABIA card payments</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email notifications for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Order Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive an email when a new order is placed</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Customer Registration</p>
                  <p className="text-sm text-muted-foreground">Receive an email when a new customer registers</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Sales Report</p>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of sales and orders</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

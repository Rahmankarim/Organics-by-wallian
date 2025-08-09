
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupPage() {
  const [status, setStatus] = useState("")

  const createAdmin = async () => {
    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setStatus(data.message)
    } catch (error) {
      setStatus("Failed to create admin user")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={createAdmin} className="w-full mb-4">
            Create Admin User
          </Button>
          {status && <p className="text-sm text-center">{status}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

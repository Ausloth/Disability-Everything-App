import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/store/useStore"
import { Key, ShieldCheck } from "lucide-react"

export function Settings() {
  const { user, licenseKey, activateLicense, activeModules } = useStore()
  const [keyInput, setKeyInput] = useState("")

  const handleActivate = () => {
    activateLicense(keyInput)
    setKeyInput("")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings & Licensing</h1>
        <p className="text-muted-foreground mt-2">Manage your organization and module unlock keys.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>Your basic organizational settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input defaultValue="Example Day Service" />
            </div>
            <div className="space-y-2">
              <Label>Admin User</Label>
              <Input value={user?.name || ''} readOnly className="bg-muted" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module License</CardTitle>
            <CardDescription>Unlock premium features for your organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {licenseKey ? (
              <div className="rounded-lg bg-green-50 dark:bg-emerald-950/20 p-4 border border-green-200 dark:border-emerald-900 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-emerald-500 mt-1" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-emerald-400">Active License</h4>
                  <p className="text-sm text-green-700 dark:text-emerald-600/80 mt-1">
                    Key: <span className="font-mono bg-green-100 dark:bg-emerald-900/50 px-1 rounded">{licenseKey}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-2">All premium modules unlocked.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseKey">Enter License Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="licenseKey" 
                      placeholder="e.g. ORG-123-PRO" 
                      value={keyInput}
                      onChange={e => setKeyInput(e.target.value)}
                    />
                    <Button variant="secondary" onClick={handleActivate} disabled={!keyInput}>
                      <Key className="w-4 h-4 mr-2" /> Activate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Hint: Try entering any key ending in "PRO" to unlock.</p>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Module Status</h4>
              <ul className="space-y-2">
                {Object.entries(activeModules).map(([mod, isActive]) => (
                  <li key={mod} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{mod.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {isActive ? (
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Active</span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full">Locked</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

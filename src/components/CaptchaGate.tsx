import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function CaptchaGate({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const unlocked = localStorage.getItem('outline_unlocked')
    if (unlocked === 'true') {
      setIsUnlocked(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim().toLowerCase() === 'support') {
      localStorage.setItem('outline_unlocked', 'true')
      setIsUnlocked(true)
    } else {
      setError(true)
      setAnswer('')
    }
  }

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Outline.</CardTitle>
          <CardDescription className="text-base">
            Please answer the security question to access the preview environment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Do we Care or Support?
              </label>
              <Input 
                autoFocus
                value={answer}
                onChange={e => {
                  setAnswer(e.target.value)
                  setError(false)
                }}
                placeholder="Enter your answer..."
                className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {error && <p className="text-sm font-medium text-red-500">Incorrect answer. Please try again.</p>}
            </div>
            <Button type="submit" className="w-full text-base py-5">
              Enter Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

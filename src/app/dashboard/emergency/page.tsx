"use client"

import { Phone, Shield, MapPin, Heart, TriangleAlert, ExternalLink, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

interface TrustedContact {
  id: string
  name: string
  relation: string
  phone: string
}

const emergencyNumbers = [
  { name: "iCall (Mental Health)", number: "9152987821", available: "Mon-Sat 8am-10pm", color: "#4F46E5" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", available: "24/7", color: "#22C55E" },
  { name: "AASRA Suicide Helpline", number: "9820466627", available: "24/7", color: "#EF4444" },
  { name: "NIMHANS", number: "080-46110007", available: "24/7", color: "#06B6D4" },
]

const safetyResources = [
  { title: "Safety Plan Template", desc: "Create your personal crisis safety plan with guided steps", icon: Shield },
  { title: "Crisis De-escalation Guide", desc: "Techniques to calm yourself during a mental health crisis", icon: Heart },
  { title: "Find Nearby Support", desc: "Locate mental health facilities and therapists near you", icon: MapPin },
]

export default function EmergencyPage() {
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([
    { id: "tc1", name: "Dr. Priya Malhotra", relation: "Therapist", phone: "+91 98765 43210" },
    { id: "tc2", name: "Arjun Sharma", relation: "Family", phone: "+91 87654 32109" },
  ])
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRelation, setNewRelation] = useState("")
  const [newPhone, setNewPhone] = useState("")

  const handleCall = (number: string, name: string) => {
    toast({ title: `Calling ${name}`, description: `Dialing ${number}...` })
  }

  const handleAddContact = () => {
    if (!newName || !newPhone) {
      toast({ title: "Please fill required fields", variant: "destructive" })
      return
    }
    setTrustedContacts((prev) => [
      ...prev,
      { id: `tc_${Date.now()}`, name: newName, relation: newRelation || "Friend", phone: newPhone },
    ])
    setAddContactOpen(false)
    setNewName("")
    setNewRelation("")
    setNewPhone("")
    toast({ title: "Contact added", description: `${newName} added to trusted contacts.` })
  }

  const handleRemoveContact = (id: string) => {
    setTrustedContacts((prev) => prev.filter((c) => c.id !== id))
    toast({ title: "Contact removed" })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Crisis Banner */}
      <div className="rounded-2xl bg-[#EF4444] p-5 text-white">
        <div className="flex items-start gap-3">
          <TriangleAlert className="w-6 h-6 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h2 className="font-bold text-lg">In immediate danger?</h2>
            <p className="text-white/90 text-sm mt-0.5">
              If you or someone is in immediate danger, call emergency services.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <Button
                className="bg-white text-[#EF4444] hover:bg-white/90 font-bold"
                onClick={() => handleCall("112", "Emergency Services")}
              >
                <Phone className="w-4 h-4 mr-1" />
                Call 112 (Emergency)
              </Button>
              <Button
                variant="glass"
                className="border-white/30"
                onClick={() => handleCall("100", "Police")}
              >
                <Phone className="w-4 h-4 mr-1" />
                Call 100 (Police)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emergency Helplines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#EF4444]" />
              Mental Health Helplines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyNumbers.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: contact.color }}
                  >
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.available}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  style={{ backgroundColor: contact.color }}
                  className="text-white hover:opacity-90 text-xs"
                  onClick={() => handleCall(contact.number, contact.name)}
                >
                  {contact.number}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trusted Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#EF4444]" />
                Trusted Contacts
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddContactOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {contact.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{contact.relation}</Badge>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleCall(contact.phone, contact.name)}
                    className="text-[#22C55E]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleRemoveContact(contact.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {trustedContacts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trusted contacts added yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Safety Resources */}
      <div>
        <h2 className="font-semibold mb-3">Safety Resources</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {safetyResources.map((resource) => {
            const Icon = resource.icon
            return (
              <Card key={resource.title} className="card-hover cursor-pointer group">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{resource.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{resource.desc}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-primary gap-1 px-0 hover:bg-transparent"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Trusted Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Relationship</Label>
              <Input placeholder="e.g., Therapist, Friend, Family" value={newRelation} onChange={(e) => setNewRelation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input placeholder="+91 98765 43210" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

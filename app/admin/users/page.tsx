"use client"

import { useEffect, useState } from "react"
import { FestivalHeader } from "@/components/festival-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminGuard } from "@/components/auth-guard"
import { supabase } from "@/lib/supabase"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Search, Download, Plus, Edit, Trash2, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { User, UserRole } from "@/lib/supabase"

type UserWithRole = User & { roles?: UserRole[] }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null)

  // Form states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("user")
  const [password, setPassword] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        roles:user_roles(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fehler beim Laden der Benutzer:", error)
    } else if (data) {
      setUsers(data as UserWithRole[])
    }

    setLoading(false)
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower))
    )
  })

  const handleAddUser = async () => {
    try {
      // Erstelle einen neuen Benutzer in der Auth-Datenbank
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) {
        toast({
          title: "Fehler",
          description: `Benutzer konnte nicht erstellt werden: ${authError.message}`,
          variant: "destructive",
        })
        return
      }

      if (!authData.user) {
        toast({
          title: "Fehler",
          description: "Benutzer konnte nicht erstellt werden",
          variant: "destructive",
        })
        return
      }

      // Erstelle einen Eintrag in der users-Tabelle
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        toast({
          title: "Fehler",
          description: `Benutzerprofil konnte nicht erstellt werden: ${profileError.message}`,
          variant: "destructive",
        })
        return
      }

      // Füge die Benutzerrolle hinzu, wenn es sich um einen Admin handelt
      if (role === "admin") {
        const { error: roleError } = await supabase.from("user_roles").insert([
          {
            user_id: authData.user.id,
            role: "admin",
            created_at: new Date().toISOString(),
          },
        ])

        if (roleError) {
          toast({
            title: "Warnung",
            description: `Benutzer wurde erstellt, aber die Rolle konnte nicht zugewiesen werden: ${roleError.message}`,
          })
        }
      }

      toast({
        title: "Erfolg",
        description: "Benutzer wurde erfolgreich erstellt",
      })

      // Formular zurücksetzen und Dialog schließen
      resetForm()
      setShowAddDialog(false)

      // Benutzerliste aktualisieren
      fetchUsers()
    } catch (error) {
      console.error("Fehler beim Erstellen des Benutzers:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!currentUser) return

    try {
      // Aktualisiere den Benutzer in der users-Tabelle
      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id)

      if (updateError) {
        toast({
          title: "Fehler",
          description: `Benutzer konnte nicht aktualisiert werden: ${updateError.message}`,
          variant: "destructive",
        })
        return
      }

      // Überprüfe, ob die Rolle geändert werden muss
      const isCurrentlyAdmin = currentUser.roles?.some((r) => r.role === "admin")

      if (role === "admin" && !isCurrentlyAdmin) {
        // Füge Admin-Rolle hinzu
        const { error: roleError } = await supabase.from("user_roles").insert([
          {
            user_id: currentUser.id,
            role: "admin",
            created_at: new Date().toISOString(),
          },
        ])

        if (roleError) {
          toast({
            title: "Warnung",
            description: `Benutzer wurde aktualisiert, aber die Rolle konnte nicht zugewiesen werden: ${roleError.message}`,
          })
        }
      } else if (role !== "admin" && isCurrentlyAdmin) {
        // Entferne Admin-Rolle
        const { error: roleError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("role", "admin")

        if (roleError) {
          toast({
            title: "Warnung",
            description: `Benutzer wurde aktualisiert, aber die Rolle konnte nicht entfernt werden: ${roleError.message}`,
          })
        }
      }

      toast({
        title: "Erfolg",
        description: "Benutzer wurde erfolgreich aktualisiert",
      })

      // Dialog schließen und Benutzerliste aktualisieren
      setShowEditDialog(false)
      fetchUsers()
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Benutzers:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!currentUser) return

    try {
      // Lösche zuerst alle abhängigen Datensätze
      await supabase.from("user_roles").delete().eq("user_id", currentUser.id)

      // Lösche den Benutzer aus der users-Tabelle
      const { error: deleteError } = await supabase.from("users").delete().eq("id", currentUser.id)

      if (deleteError) {
        toast({
          title: "Fehler",
          description: `Benutzer konnte nicht gelöscht werden: ${deleteError.message}`,
          variant: "destructive",
        })
        return
      }

      // Lösche den Benutzer aus der Auth-Datenbank
      const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.id)

      if (authError) {
        toast({
          title: "Warnung",
          description: `Benutzer wurde aus der Datenbank gelöscht, aber nicht aus der Auth-Datenbank: ${authError.message}`,
        })
      }

      toast({
        title: "Erfolg",
        description: "Benutzer wurde erfolgreich gelöscht",
      })

      // Dialog schließen und Benutzerliste aktualisieren
      setShowDeleteDialog(false)
      fetchUsers()
    } catch (error) {
      console.error("Fehler beim Löschen des Benutzers:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: UserWithRole) => {
    setCurrentUser(user)
    setFirstName(user.first_name || "")
    setLastName(user.last_name || "")
    setEmail(user.email)
    setPhone(user.phone || "")
    setRole(user.roles?.some((r) => r.role === "admin") ? "admin" : "user")
    setShowEditDialog(true)
  }

  const openDeleteDialog = (user: UserWithRole) => {
    setCurrentUser(user)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setRole("user")
    setPassword("")
    setCurrentUser(null)
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <FestivalHeader />

          <main className="container px-4 py-6 mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-festival-900">Benutzer-Verwaltung</h1>

              <div className="flex gap-2">
                <Button variant="outline" className="border-festival-200 hover:bg-festival-100">
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </Button>
                <Button className="bg-festival-600 hover:bg-festival-700" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Benutzer erstellen
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Suche nach Name, E-Mail, Telefon..."
                    className="pl-10 bg-white border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Registriert am</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Keine Benutzer gefunden
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell>
                            {user.roles?.some((r) => r.role === "admin") ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Benutzer
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString("de-DE")}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openDeleteDialog(user)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Dialog zum Hinzufügen eines Benutzers */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Rolle</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="mt-1">
                    <SelectValue placeholder="Rolle auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Benutzer</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddUser}>Benutzer erstellen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Bearbeiten eines Benutzers */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Benutzer bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">Vorname</Label>
                  <Input
                    id="editFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Nachname</Label>
                  <Input
                    id="editLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">E-Mail</Label>
                <Input id="editEmail" type="email" value={email} className="mt-1 bg-gray-50" disabled />
              </div>
              <div>
                <Label htmlFor="editPhone">Telefon (optional)</Label>
                <Input id="editPhone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="editRole">Rolle</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="editRole" className="mt-1">
                    <SelectValue placeholder="Rolle auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Benutzer</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditUser}>Änderungen speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Löschen eines Benutzers */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Benutzer löschen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Möchten Sie den Benutzer <strong>{currentUser?.email}</strong> wirklich löschen? Diese Aktion kann nicht
                rückgängig gemacht werden.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Benutzer löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </AdminGuard>
  )
}

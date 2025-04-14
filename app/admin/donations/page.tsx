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
import { Search, Plus, Edit, Trash2, DollarSign, Target, Heart } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import type { CharityProject, Donation, User } from "@/lib/supabase"

type DonationWithUser = Donation & { user: User; project: CharityProject }

export default function AdminDonationsPage() {
  const [projects, setProjects] = useState<CharityProject[]>([])
  const [donations, setDonations] = useState<DonationWithUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"projects" | "donations">("projects")

  // Projekt-Dialog-States
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [currentProject, setCurrentProject] = useState<CharityProject | null>(null)

  // Projekt-Form-States
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectImage, setProjectImage] = useState("")
  const [projectGoal, setProjectGoal] = useState("")

  useEffect(() => {
    fetchProjects()
    fetchDonations()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("charity_projects")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fehler beim Laden der Projekte:", error)
    } else if (data) {
      setProjects(data)
    }

    setLoading(false)
  }

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select(`
        *,
        user:user_id(*),
        project:project_id(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fehler beim Laden der Spenden:", error)
    } else if (data) {
      setDonations(data as DonationWithUser[])
    }
  }

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase()
    return project.name.toLowerCase().includes(searchLower) || project.description.toLowerCase().includes(searchLower)
  })

  const filteredDonations = donations.filter((donation) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      donation.project?.name.toLowerCase().includes(searchLower) ||
      donation.user?.email.toLowerCase().includes(searchLower) ||
      (donation.user?.first_name && donation.user.first_name.toLowerCase().includes(searchLower)) ||
      (donation.user?.last_name && donation.user.last_name.toLowerCase())
    )
  })

  const handleAddProject = async () => {
    try {
      if (!projectName || !projectDescription || !projectGoal) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const goalNumber = Number.parseFloat(projectGoal) * 100 // Umrechnung in Cent

      const { error } = await supabase.from("charity_projects").insert([
        {
          name: projectName,
          description: projectDescription,
          image: projectImage || "/placeholder.svg?height=200&width=300",
          goal: goalNumber,
          raised: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) {
        toast({
          title: "Fehler",
          description: `Projekt konnte nicht erstellt werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Projekt wurde erfolgreich erstellt",
      })

      // Formular zurücksetzen und Dialog schließen
      resetProjectForm()
      setShowAddProjectDialog(false)

      // Projektliste aktualisieren
      fetchProjects()
    } catch (error) {
      console.error("Fehler beim Erstellen des Projekts:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleEditProject = async () => {
    if (!currentProject) return

    try {
      if (!projectName || !projectDescription || !projectGoal) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const goalNumber = Number.parseFloat(projectGoal) * 100 // Umrechnung in Cent

      const { error } = await supabase
        .from("charity_projects")
        .update({
          name: projectName,
          description: projectDescription,
          image: projectImage || "/placeholder.svg?height=200&width=300",
          goal: goalNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentProject.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Projekt konnte nicht aktualisiert werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Projekt wurde erfolgreich aktualisiert",
      })

      // Dialog schließen und Projektliste aktualisieren
      setShowEditProjectDialog(false)
      fetchProjects()
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Projekts:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async () => {
    if (!currentProject) return

    try {
      // Prüfe zuerst, ob es Spenden für dieses Projekt gibt
      const { count, error: countError } = await supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .eq("project_id", currentProject.id)

      if (countError) {
        toast({
          title: "Fehler",
          description: `Fehler beim Prüfen der Spenden: ${countError.message}`,
          variant: "destructive",
        })
        return
      }

      if (count && count > 0) {
        toast({
          title: "Fehler",
          description: `Dieses Projekt kann nicht gelöscht werden, da bereits ${count} Spenden dafür eingegangen sind.`,
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("charity_projects").delete().eq("id", currentProject.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Projekt konnte nicht gelöscht werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Projekt wurde erfolgreich gelöscht",
      })

      // Dialog schließen und Projektliste aktualisieren
      setShowDeleteProjectDialog(false)
      fetchProjects()
    } catch (error) {
      console.error("Fehler beim Löschen des Projekts:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const openEditProjectDialog = (project: CharityProject) => {
    setCurrentProject(project)
    setProjectName(project.name)
    setProjectDescription(project.description)
    setProjectImage(project.image)
    setProjectGoal((project.goal / 100).toString())
    setShowEditProjectDialog(true)
  }

  const openDeleteProjectDialog = (project: CharityProject) => {
    setCurrentProject(project)
    setShowDeleteProjectDialog(true)
  }

  const resetProjectForm = () => {
    setProjectName("")
    setProjectDescription("")
    setProjectImage("")
    setProjectGoal("")
    setCurrentProject(null)
  }

  // Formatiere den Preis für die Anzeige
  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2) + " €"
  }

  // Berechne den Fortschritt in Prozent
  const calculateProgress = (raised: number, goal: number) => {
    return Math.min(Math.round((raised / goal) * 100), 100)
  }

  // Formatiere das Datum für die Anzeige
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("de-DE", options)
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <FestivalHeader />

          <main className="container px-4 py-6 mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-festival-900">Spenden-Verwaltung</h1>

              <div className="flex gap-2">
                <Button
                  variant={activeTab === "projects" ? "default" : "outline"}
                  onClick={() => setActiveTab("projects")}
                  className={activeTab === "projects" ? "bg-festival-600 hover:bg-festival-700" : ""}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Projekte
                </Button>
                <Button
                  variant={activeTab === "donations" ? "default" : "outline"}
                  onClick={() => setActiveTab("donations")}
                  className={activeTab === "donations" ? "bg-festival-600 hover:bg-festival-700" : ""}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Spenden
                </Button>
                {activeTab === "projects" && (
                  <Button
                    className="bg-festival-600 hover:bg-festival-700"
                    onClick={() => setShowAddProjectDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Projekt hinzufügen
                  </Button>
                )}
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={activeTab === "projects" ? "Suche nach Projekten..." : "Suche nach Spenden..."}
                    className="pl-10 bg-white border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {activeTab === "projects" ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bild</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Ziel</TableHead>
                        <TableHead>Gesammelt</TableHead>
                        <TableHead>Fortschritt</TableHead>
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
                      ) : filteredProjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Keine Projekte gefunden
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div className="relative w-12 h-12 rounded overflow-hidden">
                                <Image
                                  src={project.image || "/placeholder.svg"}
                                  alt={project.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-2 text-festival-600" />
                                {formatPrice(project.goal)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 mr-2 text-festival-600" />
                                {formatPrice(project.raised)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-full">
                                <Progress
                                  value={calculateProgress(project.raised, project.goal)}
                                  className="h-2 bg-gray-100"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {calculateProgress(project.raised, project.goal)}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEditProjectDialog(project)}>
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteProjectDialog(project)}
                                  disabled={project.raised > 0}
                                >
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
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spender</TableHead>
                        <TableHead>Projekt</TableHead>
                        <TableHead>Betrag</TableHead>
                        <TableHead>Datum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredDonations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Keine Spenden gefunden
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDonations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {donation.user?.first_name} {donation.user?.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{donation.user?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{donation.project?.name || "Unbekanntes Projekt"}</TableCell>
                            <TableCell>
                              <div className="flex items-center font-medium text-green-600">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {formatPrice(donation.amount)}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(donation.created_at)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </main>
        </div>

        {/* Dialog zum Hinzufügen eines Projekts */}
        <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neues Projekt hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="projectName">Name</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="projectDescription">Beschreibung</Label>
                <Textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="projectImage">Bild-URL</Label>
                <Input
                  id="projectImage"
                  value={projectImage}
                  onChange={(e) => setProjectImage(e.target.value)}
                  className="mt-1"
                  placeholder="/placeholder.svg?height=200&width=300"
                />
              </div>
              <div>
                <Label htmlFor="projectGoal">Spendenziel (€)</Label>
                <Input
                  id="projectGoal"
                  type="number"
                  step="0.01"
                  value={projectGoal}
                  onChange={(e) => setProjectGoal(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddProject}>Projekt hinzufügen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Bearbeiten eines Projekts */}
        <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Projekt bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editProjectName">Name</Label>
                <Input
                  id="editProjectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editProjectDescription">Beschreibung</Label>
                <Textarea
                  id="editProjectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editProjectImage">Bild-URL</Label>
                <Input
                  id="editProjectImage"
                  value={projectImage}
                  onChange={(e) => setProjectImage(e.target.value)}
                  className="mt-1"
                  placeholder="/placeholder.svg?height=200&width=300"
                />
              </div>
              <div>
                <Label htmlFor="editProjectGoal">Spendenziel (€)</Label>
                <Input
                  id="editProjectGoal"
                  type="number"
                  step="0.01"
                  value={projectGoal}
                  onChange={(e) => setProjectGoal(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditProject}>Änderungen speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Löschen eines Projekts */}
        <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Projekt löschen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Möchten Sie das Projekt <strong>{currentProject?.name}</strong> wirklich löschen? Diese Aktion kann
                nicht rückgängig gemacht werden.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteProjectDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDeleteProject}>
                Projekt löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </AdminGuard>
  )
}

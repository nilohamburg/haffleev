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
import { Search, Plus, Edit, Trash2, Calendar, Clock, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { Performance, Artist } from "@/lib/supabase"

type PerformanceWithArtist = Performance & { artist: Artist }

export default function AdminSchedulePage() {
  const [performances, setPerformances] = useState<PerformanceWithArtist[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentPerformance, setCurrentPerformance] = useState<PerformanceWithArtist | null>(null)

  // Form states
  const [artistId, setArtistId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [stage, setStage] = useState("")

  useEffect(() => {
    fetchPerformances()
    fetchArtists()
  }, [])

  const fetchPerformances = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("performances")
      .select(`
        *,
        artist:artist_id(*)
      `)
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      console.error("Fehler beim Laden der Auftritte:", error)
    } else if (data) {
      setPerformances(data as PerformanceWithArtist[])
    }

    setLoading(false)
  }

  const fetchArtists = async () => {
    const { data, error } = await supabase.from("artists").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Fehler beim Laden der Künstler:", error)
    } else if (data) {
      setArtists(data)
    }
  }

  const filteredPerformances = performances.filter((performance) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      performance.artist.name.toLowerCase().includes(searchLower) ||
      performance.date.toLowerCase().includes(searchLower) ||
      performance.time.toLowerCase().includes(searchLower) ||
      performance.stage.toLowerCase().includes(searchLower)
    )
  })

  const handleAddPerformance = async () => {
    try {
      if (!artistId || !date || !time || !stage) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("performances").insert([
        {
          artist_id: Number.parseInt(artistId),
          date,
          time,
          stage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) {
        toast({
          title: "Fehler",
          description: `Auftritt konnte nicht erstellt werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Auftritt wurde erfolgreich erstellt",
      })

      // Formular zurücksetzen und Dialog schließen
      resetForm()
      setShowAddDialog(false)

      // Auftrittsliste aktualisieren
      fetchPerformances()
    } catch (error) {
      console.error("Fehler beim Erstellen des Auftritts:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleEditPerformance = async () => {
    if (!currentPerformance) return

    try {
      if (!artistId || !date || !time || !stage) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("performances")
        .update({
          artist_id: Number.parseInt(artistId),
          date,
          time,
          stage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentPerformance.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Auftritt konnte nicht aktualisiert werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Auftritt wurde erfolgreich aktualisiert",
      })

      // Dialog schließen und Auftrittsliste aktualisieren
      setShowEditDialog(false)
      fetchPerformances()
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Auftritts:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleDeletePerformance = async () => {
    if (!currentPerformance) return

    try {
      const { error } = await supabase.from("performances").delete().eq("id", currentPerformance.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Auftritt konnte nicht gelöscht werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Auftritt wurde erfolgreich gelöscht",
      })

      // Dialog schließen und Auftrittsliste aktualisieren
      setShowDeleteDialog(false)
      fetchPerformances()
    } catch (error) {
      console.error("Fehler beim Löschen des Auftritts:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (performance: PerformanceWithArtist) => {
    setCurrentPerformance(performance)
    setArtistId(performance.artist_id.toString())
    setDate(performance.date)
    setTime(performance.time)
    setStage(performance.stage)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (performance: PerformanceWithArtist) => {
    setCurrentPerformance(performance)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setArtistId("")
    setDate("")
    setTime("")
    setStage("")
    setCurrentPerformance(null)
  }

  // Formatiere das Datum für die Anzeige
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }
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
              <h1 className="text-2xl font-bold text-festival-900">Zeitplan-Verwaltung</h1>

              <div className="flex gap-2">
                <Button className="bg-festival-600 hover:bg-festival-700" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Auftritt hinzufügen
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Suche nach Künstler, Datum, Bühne..."
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
                      <TableHead>Künstler</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Uhrzeit</TableHead>
                      <TableHead>Bühne</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPerformances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Keine Auftritte gefunden
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPerformances.map((performance) => (
                        <TableRow key={performance.id}>
                          <TableCell className="font-medium">{performance.artist.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-festival-600" />
                              {formatDate(performance.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-festival-600" />
                              {performance.time}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-festival-600" />
                              {performance.stage}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(performance)}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openDeleteDialog(performance)}>
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

        {/* Dialog zum Hinzufügen eines Auftritts */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Auftritt hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="artist">Künstler</Label>
                <Select value={artistId} onValueChange={setArtistId}>
                  <SelectTrigger id="artist" className="mt-1">
                    <SelectValue placeholder="Künstler auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id.toString()}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Uhrzeit</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stage">Bühne</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger id="stage" className="mt-1">
                    <SelectValue placeholder="Bühne auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hauptbühne">Hauptbühne</SelectItem>
                    <SelectItem value="Waldbühne">Waldbühne</SelectItem>
                    <SelectItem value="Seebühne">Seebühne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddPerformance}>Auftritt hinzufügen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Bearbeiten eines Auftritts */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Auftritt bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editArtist">Künstler</Label>
                <Select value={artistId} onValueChange={setArtistId}>
                  <SelectTrigger id="editArtist" className="mt-1">
                    <SelectValue placeholder="Künstler auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id.toString()}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDate">Datum</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editTime">Uhrzeit</Label>
                <Input
                  id="editTime"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editStage">Bühne</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger id="editStage" className="mt-1">
                    <SelectValue placeholder="Bühne auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hauptbühne">Hauptbühne</SelectItem>
                    <SelectItem value="Waldbühne">Waldbühne</SelectItem>
                    <SelectItem value="Seebühne">Seebühne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditPerformance}>Änderungen speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Löschen eines Auftritts */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Auftritt löschen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Möchten Sie den Auftritt von <strong>{currentPerformance?.artist.name}</strong> am{" "}
                <strong>{currentPerformance ? formatDate(currentPerformance.date) : ""}</strong> wirklich löschen? Diese
                Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDeletePerformance}>
                Auftritt löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </AdminGuard>
  )
}

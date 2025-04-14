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
import { Search, Plus, Edit, Trash2, Music, Instagram, Twitter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import type { Artist } from "@/lib/supabase"

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [bio, setBio] = useState("")
  const [genre, setGenre] = useState("")
  const [instagram, setInstagram] = useState("")
  const [twitter, setTwitter] = useState("")

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    setLoading(true)

    const { data, error } = await supabase.from("artists").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Fehler beim Laden der Künstler:", error)
    } else if (data) {
      setArtists(data)
    }

    setLoading(false)
  }

  const filteredArtists = artists.filter((artist) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      artist.name.toLowerCase().includes(searchLower) ||
      artist.genre.toLowerCase().includes(searchLower) ||
      artist.bio.toLowerCase().includes(searchLower)
    )
  })

  const handleAddArtist = async () => {
    try {
      if (!name || !genre || !bio) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const socials: { instagram?: string; twitter?: string } = {}
      if (instagram) socials.instagram = instagram
      if (twitter) socials.twitter = twitter

      const { error } = await supabase.from("artists").insert([
        {
          name,
          image: image || "/placeholder.svg?height=300&width=300",
          bio,
          genre,
          socials,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) {
        toast({
          title: "Fehler",
          description: `Künstler konnte nicht erstellt werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Künstler wurde erfolgreich erstellt",
      })

      // Formular zurücksetzen und Dialog schließen
      resetForm()
      setShowAddDialog(false)

      // Künstlerliste aktualisieren
      fetchArtists()
    } catch (error) {
      console.error("Fehler beim Erstellen des Künstlers:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleEditArtist = async () => {
    if (!currentArtist) return

    try {
      if (!name || !genre || !bio) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const socials: { instagram?: string; twitter?: string } = {}
      if (instagram) socials.instagram = instagram
      if (twitter) socials.twitter = twitter

      const { error } = await supabase
        .from("artists")
        .update({
          name,
          image: image || "/placeholder.svg?height=300&width=300",
          bio,
          genre,
          socials,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentArtist.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Künstler konnte nicht aktualisiert werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Künstler wurde erfolgreich aktualisiert",
      })

      // Dialog schließen und Künstlerliste aktualisieren
      setShowEditDialog(false)
      fetchArtists()
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Künstlers:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleDeleteArtist = async () => {
    if (!currentArtist) return

    try {
      // Prüfe zuerst, ob der Künstler in Performances verwendet wird
      const { count, error: countError } = await supabase
        .from("performances")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", currentArtist.id)

      if (countError) {
        toast({
          title: "Fehler",
          description: `Fehler beim Prüfen der Abhängigkeiten: ${countError.message}`,
          variant: "destructive",
        })
        return
      }

      if (count && count > 0) {
        toast({
          title: "Fehler",
          description: `Dieser Künstler kann nicht gelöscht werden, da er in ${count} Auftritten verwendet wird. Bitte entfernen Sie zuerst diese Auftritte.`,
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("artists").delete().eq("id", currentArtist.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Künstler konnte nicht gelöscht werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Künstler wurde erfolgreich gelöscht",
      })

      // Dialog schließen und Künstlerliste aktualisieren
      setShowDeleteDialog(false)
      fetchArtists()
    } catch (error) {
      console.error("Fehler beim Löschen des Künstlers:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (artist: Artist) => {
    setCurrentArtist(artist)
    setName(artist.name)
    setImage(artist.image)
    setBio(artist.bio)
    setGenre(artist.genre)
    setInstagram(artist.socials?.instagram || "")
    setTwitter(artist.socials?.twitter || "")
    setShowEditDialog(true)
  }

  const openDeleteDialog = (artist: Artist) => {
    setCurrentArtist(artist)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setName("")
    setImage("")
    setBio("")
    setGenre("")
    setInstagram("")
    setTwitter("")
    setCurrentArtist(null)
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <FestivalHeader />

          <main className="container px-4 py-6 mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-festival-900">Künstler-Verwaltung</h1>

              <div className="flex gap-2">
                <Button className="bg-festival-600 hover:bg-festival-700" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Künstler hinzufügen
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Suche nach Name, Genre, Beschreibung..."
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
                      <TableHead>Bild</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Social Media</TableHead>
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
                    ) : filteredArtists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Keine Künstler gefunden
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredArtists.map((artist) => (
                        <TableRow key={artist.id}>
                          <TableCell>
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={artist.image || "/placeholder.svg"}
                                alt={artist.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{artist.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Music className="h-4 w-4 mr-2 text-festival-600" />
                              {artist.genre}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {artist.socials?.instagram && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Instagram className="h-4 w-4 mr-1" />
                                  {artist.socials.instagram}
                                </div>
                              )}
                              {artist.socials?.twitter && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Twitter className="h-4 w-4 mr-1" />
                                  {artist.socials.twitter}
                                </div>
                              )}
                              {!artist.socials?.instagram && !artist.socials?.twitter && (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(artist)}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openDeleteDialog(artist)}>
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

        {/* Dialog zum Hinzufügen eines Künstlers */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Künstler hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="image">Bild-URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="mt-1"
                  placeholder="/placeholder.svg?height=300&width=300"
                />
              </div>
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="bio">Biografie</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram (ohne @)</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="mt-1"
                  placeholder="benutzername"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter (ohne @)</Label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="mt-1"
                  placeholder="benutzername"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddArtist}>Künstler hinzufügen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Bearbeiten eines Künstlers */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Künstler bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input id="editName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="editImage">Bild-URL</Label>
                <Input
                  id="editImage"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="mt-1"
                  placeholder="/placeholder.svg?height=300&width=300"
                />
              </div>
              <div>
                <Label htmlFor="editGenre">Genre</Label>
                <Input
                  id="editGenre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editBio">Biografie</Label>
                <Textarea
                  id="editBio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editInstagram">Instagram (ohne @)</Label>
                <Input
                  id="editInstagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="mt-1"
                  placeholder="benutzername"
                />
              </div>
              <div>
                <Label htmlFor="editTwitter">Twitter (ohne @)</Label>
                <Input
                  id="editTwitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="mt-1"
                  placeholder="benutzername"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditArtist}>Änderungen speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Löschen eines Künstlers */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Künstler löschen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Möchten Sie den Künstler <strong>{currentArtist?.name}</strong> wirklich löschen? Diese Aktion kann
                nicht rückgängig gemacht werden.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDeleteArtist}>
                Künstler löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </AdminGuard>
  )
}

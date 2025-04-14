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
import { Search, Plus, Edit, Trash2, Calendar, Clock, DollarSign, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import type { AuctionItem } from "@/lib/supabase"

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentAuction, setCurrentAuction] = useState<AuctionItem | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [startingBid, setStartingBid] = useState("")
  const [status, setStatus] = useState("upcoming")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    setLoading(true)

    const { data, error } = await supabase.from("auction_items").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Fehler beim Laden der Auktionen:", error)
    } else if (data) {
      setAuctions(data)
    }

    setLoading(false)
  }

  const filteredAuctions = auctions.filter((auction) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      auction.title.toLowerCase().includes(searchLower) ||
      auction.description.toLowerCase().includes(searchLower) ||
      auction.status.toLowerCase().includes(searchLower)
    )
  })

  const handleAddAuction = async () => {
    try {
      if (!title || !description || !startingBid || !status) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const startingBidNumber = Number.parseFloat(startingBid) * 100 // Umrechnung in Cent

      const { error } = await supabase.from("auction_items").insert([
        {
          title,
          description,
          image: image || "/placeholder.svg?height=200&width=300",
          starting_bid: startingBidNumber,
          current_bid: status === "active" ? startingBidNumber : null,
          bids_count: 0,
          status,
          starts_at: startsAt || new Date().toISOString(),
          ends_at: endsAt || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) {
        toast({
          title: "Fehler",
          description: `Auktion konnte nicht erstellt werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Auktion wurde erfolgreich erstellt",
      })

      // Formular zurücksetzen und Dialog schließen
      resetForm()
      setShowAddDialog(false)

      // Auktionsliste aktualisieren
      fetchAuctions()
    } catch (error) {
      console.error("Fehler beim Erstellen der Auktion:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleEditAuction = async () => {
    if (!currentAuction) return

    try {
      if (!title || !description || !startingBid || !status) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        })
        return
      }

      const startingBidNumber = Number.parseFloat(startingBid) * 100 // Umrechnung in Cent

      const updateData: Partial<AuctionItem> = {
        title,
        description,
        image: image || "/placeholder.svg?height=200&width=300",
        starting_bid: startingBidNumber,
        status,
        starts_at: startsAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Nur setzen, wenn der Status aktiv ist und es noch kein Gebot gibt
      if (
        status === "active" &&
        (!currentAuction.current_bid || currentAuction.current_bid === currentAuction.starting_bid)
      ) {
        updateData.current_bid = startingBidNumber
      }

      // Nur setzen, wenn ein Enddatum angegeben wurde
      if (endsAt) {
        updateData.ends_at = endsAt
      }

      const { error } = await supabase.from("auction_items").update(updateData).eq("id", currentAuction.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Auktion konnte nicht aktualisiert werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Auktion wurde erfolgreich aktualisiert",
      })

      // Dialog schließen und Auktionsliste aktualisieren
      setShowEditDialog(false)
      fetchAuctions()
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Auktion:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAuction = async () => {
    if (!currentAuction) return

    try {
      // Prüfe zuerst, ob es Gebote für diese Auktion gibt
      const { count, error: countError } = await supabase
        .from("bids")
        .select("*", { count: "exact", head: true })
        .eq("auction_item_id", currentAuction.id)

      if (countError) {
        toast({
          title: "Fehler",
          description: `Fehler beim Prüfen der Gebote: ${countError.message}`,
          variant: "destructive",
        })
        return
      }

      if (count && count > 0) {
        toast({
          title: "Fehler",
          description: `Diese Auktion kann nicht gelöscht werden, da bereits ${count} Gebote abgegeben wurden.`,
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("auction_items").delete().eq("id", currentAuction.id)

      if (error) {
        toast({
          title: "Fehler",
          description: `Auktion konnte nicht gelöscht werden: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Erfolg",
        description: "Auktion wurde erfolgreich gelöscht",
      })

      // Dialog schließen und Auktionsliste aktualisieren
      setShowDeleteDialog(false)
      fetchAuctions()
    } catch (error) {
      console.error("Fehler beim Löschen der Auktion:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (auction: AuctionItem) => {
    setCurrentAuction(auction)
    setTitle(auction.title)
    setDescription(auction.description)
    setImage(auction.image)
    setStartingBid((auction.starting_bid / 100).toString())
    setStatus(auction.status)
    setStartsAt(auction.starts_at)
    setEndsAt(auction.ends_at || "")
    setShowEditDialog(true)
  }

  const openDeleteDialog = (auction: AuctionItem) => {
    setCurrentAuction(auction)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setImage("")
    setStartingBid("")
    setStatus("upcoming")
    setStartsAt("")
    setEndsAt("")
    setCurrentAuction(null)
  }

  // Formatiere das Datum für die Anzeige
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("de-DE", options)
  }

  // Formatiere den Preis für die Anzeige
  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2) + " €"
  }

  // Statusanzeige mit Farbe
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Aktiv
          </span>
        )
      case "upcoming":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Bevorstehend
          </span>
        )
      case "ended":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Beendet
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <FestivalHeader />

          <main className="container px-4 py-6 mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-festival-900">Auktionen-Verwaltung</h1>

              <div className="flex gap-2">
                <Button className="bg-festival-600 hover:bg-festival-700" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Auktion hinzufügen
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Suche nach Titel, Beschreibung, Status..."
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
                      <TableHead>Titel</TableHead>
                      <TableHead>Startgebot</TableHead>
                      <TableHead>Aktuelles Gebot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Zeitraum</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-festival-600"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAuctions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Keine Auktionen gefunden
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuctions.map((auction) => (
                        <TableRow key={auction.id}>
                          <TableCell>
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <Image
                                src={auction.image || "/placeholder.svg"}
                                alt={auction.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{auction.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-festival-600" />
                              {formatPrice(auction.starting_bid)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {auction.current_bid ? (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                                {formatPrice(auction.current_bid)}
                                {auction.bids_count > 0 && (
                                  <span className="ml-2 flex items-center text-xs text-gray-500">
                                    <Users className="h-3 w-3 mr-1" />
                                    {auction.bids_count}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(auction.status)}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div className="flex items-center mb-1">
                                <Calendar className="h-3 w-3 mr-1 text-festival-600" />
                                {formatDate(auction.starts_at)}
                              </div>
                              {auction.ends_at && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-festival-600" />
                                  {formatDate(auction.ends_at)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(auction)}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(auction)}
                                disabled={auction.bids_count > 0}
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
          </main>
        </div>

        {/* Dialog zum Hinzufügen einer Auktion */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neue Auktion hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Bild-URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="mt-1"
                  placeholder="/placeholder.svg?height=200&width=300"
                />
              </div>
              <div>
                <Label htmlFor="startingBid">Startgebot (€)</Label>
                <Input
                  id="startingBid"
                  type="number"
                  step="0.01"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Bevorstehend</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="ended">Beendet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startsAt">Startdatum</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endsAt">Enddatum (optional)</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddAuction}>Auktion hinzufügen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Bearbeiten einer Auktion */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Auktion bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editTitle">Titel</Label>
                <Input
                  id="editTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Beschreibung</Label>
                <Textarea
                  id="editDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editImage">Bild-URL</Label>
                <Input
                  id="editImage"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="mt-1"
                  placeholder="/placeholder.svg?height=200&width=300"
                />
              </div>
              <div>
                <Label htmlFor="editStartingBid">Startgebot (€)</Label>
                <Input
                  id="editStartingBid"
                  type="number"
                  step="0.01"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  className="mt-1"
                  required
                  disabled={currentAuction?.bids_count && currentAuction.bids_count > 0}
                />
                {currentAuction?.bids_count && currentAuction.bids_count > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Das Startgebot kann nicht mehr geändert werden, da bereits Gebote abgegeben wurden.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="editStatus" className="mt-1">
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Bevorstehend</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="ended">Beendet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStartsAt">Startdatum</Label>
                <Input
                  id="editStartsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editEndsAt">Enddatum (optional)</Label>
                <Input
                  id="editEndsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditAuction}>Änderungen speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog zum Löschen einer Auktion */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Auktion löschen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Möchten Sie die Auktion <strong>{currentAuction?.title}</strong> wirklich löschen? Diese Aktion kann
                nicht rückgängig gemacht werden.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDeleteAuction}>
                Auktion löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </AdminGuard>
  )
}

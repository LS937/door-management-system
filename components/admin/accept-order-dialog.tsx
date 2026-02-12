"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { updateOrder } from "@/lib/storage"
import { Order } from "@/lib/types"
import { format } from "date-fns"

interface AcceptOrderDialogProps {
  order: Order
  onClose: () => void
}

export default function AcceptOrderDialog({ order, onClose }: AcceptOrderDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAccept = async () => {
    if (!selectedDate || isSubmitting) return

    setIsSubmitting(true)
    try {
      await updateOrder(order.id, {
        status: 'accepted',
        expectedDeliveryDate: selectedDate.toISOString(),
      })

      onClose()
    } catch (error) {
      console.error('Error accepting order:', error)
      alert('Failed to accept order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Accept Order</DialogTitle>
          <DialogDescription>
            Set the expected delivery date for order {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Expected Delivery Date *</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                Selected: {format(selectedDate, 'PPP')}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleAccept} 
              className="flex-1"
              disabled={!selectedDate || isSubmitting}
            >
              {isSubmitting ? 'Accepting...' : 'Accept Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

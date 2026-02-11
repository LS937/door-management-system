"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { addPickupRequest, updateOrder } from "@/lib/storage"
import { Order, PickupRequest } from "@/lib/types"

interface PickupRequestDialogProps {
  userId: string
  preparedOrders: Order[]
  onClose: () => void
  onSuccess: () => void
}

export default function PickupRequestDialog({ userId, preparedOrders, onClose, onSuccess }: PickupRequestDialogProps) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleOrder = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedOrderIds.length === 0 || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const pickupRequest: PickupRequest = {
        id: crypto.randomUUID(),
        customerId: userId,
        orderIds: selectedOrderIds,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      }

      await addPickupRequest(pickupRequest)

      // Update order statuses to pickup_requested
      for (const orderId of selectedOrderIds) {
        await updateOrder(orderId, { status: 'pickup_requested' })
      }

      onSuccess()
    } catch (error) {
      console.error('Error requesting pickup:', error)
      alert('Failed to request pickup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Pickup</DialogTitle>
          <DialogDescription>
            Select the prepared orders you want to request pickup for
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {preparedOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No prepared orders available for pickup
              </p>
            ) : (
              preparedOrders.map(order => (
                <div key={order.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={order.id}
                    checked={selectedOrderIds.includes(order.id)}
                    onCheckedChange={() => handleToggleOrder(order.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={order.id} className="cursor-pointer font-medium">
                      {order.orderNumber}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.orderMessage.substring(0, 80)}
                      {order.orderMessage.length > 80 ? '...' : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={selectedOrderIds.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Requesting...' : `Request Pickup (${selectedOrderIds.length})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

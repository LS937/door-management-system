"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateOrder } from "@/lib/storage"
import { Order } from "@/lib/types"

interface RejectOrderDialogProps {
  order: Order
  onClose: () => void
}

export default function RejectOrderDialog({ order, onClose }: RejectOrderDialogProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReject = async () => {
    if (!reason.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await updateOrder(order.id, {
        status: 'rejected',
        rejectionReason: reason,
      })

      onClose()
    } catch (error) {
      console.error('Error rejecting order:', error)
      alert('Failed to reject order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Order</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting order {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this order is being rejected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              variant="destructive"
              className="flex-1"
              disabled={!reason.trim() || isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Image as ImageIcon } from 'lucide-react'

export function PhotoGalleryDialog({
  photos,
  open,
  onOpenChange,
}: {
  photos: string[]
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-sm print:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" /> Galeria de Evidências
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {photos.length > 0 ? (
            <Carousel className="w-full max-w-md mx-auto">
              <CarouselContent>
                {photos.map((url, i) => (
                  <CarouselItem key={i}>
                    <div className="p-1">
                      <img
                        src={url}
                        alt={`Evidência ${i + 1}`}
                        className="w-full h-80 object-cover rounded-md border shadow-sm"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-background/80 hover:bg-background" />
              <CarouselNext className="right-2 bg-background/80 hover:bg-background" />
            </Carousel>
          ) : (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
              <ImageIcon className="w-12 h-12 mb-3 text-muted-foreground/30" />
              <p>Nenhuma foto registrada para este item.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

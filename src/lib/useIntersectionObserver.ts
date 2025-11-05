import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  root?: Element | null
  rootMargin?: string
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<Element>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        // Only trigger once per intersection to prevent multiple loads
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true)
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options.threshold, options.root, options.rootMargin, hasTriggered])

  // Reset trigger when needed (useful for pagination)
  const resetTrigger = () => setHasTriggered(false)

  return { ref, isIntersecting, hasTriggered, resetTrigger }
}

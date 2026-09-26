/**
 * Cardback Image Fallback Utility
 * Standard placeholder asset when figures or items don't have an assigned photo.
 */

export const CARDBACK_PLACEHOLDER_IMAGE = '/cardback_placeholder.jpeg';

/**
 * Returns a valid image URL or the official Cardback blister placeholder.
 */
export function getFigureImageUrl(imageUrl?: string | null): string {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return CARDBACK_PLACEHOLDER_IMAGE;
  }
  return imageUrl;
}

/**
 * React onError handler to replace broken or failed images with the Cardback placeholder.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== window.location.origin + CARDBACK_PLACEHOLDER_IMAGE && target.src !== CARDBACK_PLACEHOLDER_IMAGE) {
    target.src = CARDBACK_PLACEHOLDER_IMAGE;
  }
}

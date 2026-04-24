// Server-safe HTML sanitizer — strips tags and enforces length limits
const sanitizeText = (input: string, maxLength: number): string => {
  const stripped = input.replace(/<[^>]*>/g, '').trim()
  return stripped.slice(0, maxLength)
}

export const sanitizeMarkerTitle = (title: string): string =>
  sanitizeText(title, 100)

export const sanitizeMarkerDescription = (desc: string): string =>
  sanitizeText(desc, 500)

export const sanitizeWorkspaceName = (name: string): string =>
  sanitizeText(name, 50)

// Validates WGS-84 coordinate bounds
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

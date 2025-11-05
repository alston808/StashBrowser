import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// Helper function to create authenticated image URLs
// If imagePath is a blob URL or invalid, entityId and entityType can be used to construct proper endpoint
export const createAuthenticatedImageUrl = (
	imagePath: string | null | undefined,
	entityId?: string | null,
	entityType?: string | null
): string | null => {
	const apiKey = import.meta.env.VITE_STASH_API_KEY
	const baseUrl = import.meta.env.VITE_STASH_GRAPHQL_URL || 'https://x.alst.site/graphql'
	const url = new URL(baseUrl)
	const baseHost = `${url.protocol}//${url.host}`

	// If we have a valid image path, try to use it first
	if (imagePath) {
		// Detect and handle blob URLs - these can't be used directly as image src
		if (imagePath.startsWith('blob:')) {
			// Use entity context to construct proper authenticated image endpoint
			if (entityId && entityType) {
				const imageEndpoint = `/image/${entityType}/${entityId}`
				const fullUrl = `${baseHost}${imageEndpoint}`
				return `${fullUrl}?apikey=${apiKey}`
			}
			// Cannot convert blob URLs without entity context
			return null
		}

		// If it's already a full HTTP/HTTPS URL, ensure it has API key authentication
		if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
			const separator = imagePath.includes('?') ? '&' : '?'
			return `${imagePath}${separator}apikey=${apiKey}`
		}

		// For relative paths, construct full URL and add authentication
		const fullUrl = `${baseHost}${imagePath}`
		const separator = fullUrl.includes('?') ? '&' : '?'
		return `${fullUrl}${separator}apikey=${apiKey}`
	}

	// Fallback: use entity ID to construct image endpoint if no path provided
	if (entityId && entityType) {
		const imageEndpoint = `/image/${entityType}/${entityId}`
		const fullUrl = `${baseHost}${imageEndpoint}`
		return `${fullUrl}?apikey=${apiKey}`
	}

	return null
}

// Helper function to create authenticated video URLs
export const createAuthenticatedVideoUrl = (videoPath: string | null | undefined): string | null => {
	if (!videoPath) return null

	const apiKey = import.meta.env.VITE_STASH_API_KEY
	const baseUrl = import.meta.env.VITE_STASH_GRAPHQL_URL || 'https://x.alst.site/graphql'

	// If it's already a full URL, ensure it has API key authentication
	if (videoPath.startsWith('http')) {
		const separator = videoPath.includes('?') ? '&' : '?'
		return `${videoPath}${separator}apikey=${apiKey}`
	}

	// For relative paths, construct full URL and add authentication
	const url = new URL(baseUrl)
	const fullUrl = `${url.protocol}//${url.host}${videoPath}`
	const separator = fullUrl.includes('?') ? '&' : '?'

	return `${fullUrl}${separator}apikey=${apiKey}`
}

// HTTP connection to the API
const httpLink = createHttpLink({
	uri: import.meta.env.VITE_STASH_GRAPHQL_URL || 'https://x.alst.site/graphql',
})

// Auth link to add API key header
const authLink = setContext((_, { headers }) => {
	const apiKey = import.meta.env.VITE_STASH_API_KEY

	if (!apiKey) {
		console.warn('Stash API key not configured. Please set VITE_STASH_API_KEY in your .env.local file')
	}

	return {
		headers: {
			...headers,
			...(apiKey && { ApiKey: apiKey }),
		},
	}
})

// Cache implementation with optimized policies
const cache = new InMemoryCache({
	typePolicies: {
		Query: {
			fields: {
				findScenes: {
					// Enable pagination caching - key by filter args except page/per_page
					keyArgs: ['filter', ['sort', 'direction'], 'scene_filter'],
					merge(existing = { count: 0, scenes: [] }, incoming) {
						const existingScenes = existing.scenes ?? []
						const incomingScenes = incoming.scenes ?? []
						const seenIds = new Set(existingScenes.map(s => s.id))
						const mergedScenes = [
							...existingScenes,
							...incomingScenes.filter(s => !seenIds.has(s.id)),
						]
						return { count: incoming.count, scenes: mergedScenes }
					},
				},
				findTags: {
					// Enable pagination caching for tags
					keyArgs: ['filter', ['sort', 'direction'], 'tag_filter'],
					merge(existing = { count: 0, tags: [] }, incoming) {
						return {
							count: incoming.count,
							tags: [...existing.tags, ...incoming.tags],
						}
					},
				},
				findPerformers: {
					// Enable pagination caching for performers
					keyArgs: ['filter', ['sort', 'direction'], 'performer_filter'],
					merge(existing = { count: 0, performers: [] }, incoming) {
						const existingItems = existing.performers ?? []
						const incomingItems = incoming.performers ?? []
						const seen = new Set(existingItems.map(p => p.id))
						const merged = [
							...existingItems,
							...incomingItems.filter(p => !seen.has(p.id)),
						]
						return { count: incoming.count, performers: merged }
					},
				},
				findStudios: {
					// Enable pagination caching for studios
					keyArgs: ['filter', ['sort', 'direction'], 'studio_filter'],
					merge(existing = { count: 0, studios: [] }, incoming) {
						return {
							count: incoming.count,
							studios: [...existing.studios, ...incoming.studios],
						}
					},
				},
			},
		},
		Scene: {
			keyFields: ['id'],
			fields: {
				paths: {
					// Custom merge function for ScenePathsType objects
					// Since ScenePathsType doesn't have an ID, we merge by combining fields
					merge(existing, incoming) {
						return { ...existing, ...incoming }
					},
				},
			},
		},
		Performer: {
			keyFields: ['id'],
		},
		Studio: {
			keyFields: ['id'],
		},
		Tag: {
			keyFields: ['id'],
		},
	},
})

// Create the apollo client
export const apolloClient = new ApolloClient({
	link: authLink.concat(httpLink),
	cache,
	defaultOptions: {
		watchQuery: {
			fetchPolicy: 'cache-and-network',
			nextFetchPolicy: 'cache-first',
		},
		query: {
			fetchPolicy: 'cache-first',
		},
	},
})

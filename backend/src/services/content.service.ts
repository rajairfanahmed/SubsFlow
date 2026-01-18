import { Content } from '../models';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { logger } from '../utils';
import { Types } from 'mongoose';

const CACHE_TTL = 3600; // 1 hour
const CACHE_KEY_PREFIX = 'content:';

export class ContentService {
    /**
     * Get list of published content with caching
     */
    async listContent(
        query: Record<string, unknown>,
        page: number,
        limit: number
    ): Promise<{ content: any[]; total: number }> {
        const cacheKey = `${CACHE_KEY_PREFIX}list:${JSON.stringify(query)}:${page}:${limit}`;

        try {
            if (await isRedisConnected()) {
                const redis = getRedisClient();
                const cached = await redis.get(cacheKey);
                if (cached) {
                    logger.debug('Content list cache hit', { cacheKey });
                    return JSON.parse(cached);
                }
            }
        } catch (error) {
            logger.warn('Redis cache read error', { error });
        }

        const skip = (page - 1) * limit;

        const [content, total] = await Promise.all([
            Content.find(query)
                .select('-fileUrl') // Exclude fileUrl
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Content.countDocuments(query),
        ]);

        const result = { content, total };

        try {
            if (await isRedisConnected()) {
                const redis = getRedisClient();
                await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
            }
        } catch (error) {
            logger.warn('Redis cache write error', { error });
        }

        return result;
    }

    /**
     * Get single content by ID with caching
     */
    async getContentById(id: string): Promise<any> {
        const cacheKey = `${CACHE_KEY_PREFIX}${id}`;

        try {
            if (await isRedisConnected()) {
                const redis = getRedisClient();
                const cached = await redis.get(cacheKey);
                if (cached) {
                    logger.debug('Content cache hit', { id });
                    return JSON.parse(cached);
                }
            }
        } catch (error) {
            logger.warn('Redis cache read error', { error });
        }

        const content = await Content.findById(id).lean();

        if (content) {
            try {
                if (await isRedisConnected()) {
                    const redis = getRedisClient();
                    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(content));
                }
            } catch (error) {
                logger.warn('Redis cache write error', { error });
            }
        }

        return content;
    }

    /**
     * Invalidate content cache
     * Should be called when content is created, updated, or deleted
     */
    async invalidateCache(id?: string): Promise<void> {
        try {
            if (await isRedisConnected()) {
                const redis = getRedisClient();
                const keys = await redis.keys(`${CACHE_KEY_PREFIX}*`);
                if (keys.length > 0) {
                    await redis.del(...keys);
                    logger.info('Content cache invalidated');
                }
            }
        } catch (error) {
            logger.warn('Redis cache invalidation error', { error });
        }
    }
}

export const contentService = new ContentService();

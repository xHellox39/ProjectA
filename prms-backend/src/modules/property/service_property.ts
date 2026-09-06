import { prisma } from '../../db';

/** Convert date-only strings (YYYY-MM-DD) to Date objects for Prisma DateTime fields */
export function normalizeDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val;

    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
}

/**
 * Validate and normalize latitude.
 * Latitude must be between -90 and 90.
 */
function normalizeLatitude(val: any): number | null | undefined {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;

    const number = Number(val);

    if (!Number.isFinite(number)) {
        throw new Error('Invalid latitude');
    }

    if (number < -90 || number > 90) {
        throw new Error('Latitude must be between -90 and 90');
    }

    return number;
}

/**
 * Validate and normalize longitude.
 * Longitude must be between -180 and 180.
 */
function normalizeLongitude(val: any): number | null | undefined {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;

    const number = Number(val);

    if (!Number.isFinite(number)) {
        throw new Error('Invalid longitude');
    }

    if (number < -180 || number > 180) {
        throw new Error('Longitude must be between -180 and 180');
    }

    return number;
}

export async function getAllProperties(page = 1, limit = 10) {
    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: 'desc' },
            include: {
                owner: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                amenities: true,
                images: true,
                category: true,
            },
        }),
        prisma.property.count(),
    ]);

    return {
        properties,
        total,
    };
}

/**
 * Search/filter properties.
 */
export async function searchProperties(
    page = 1,
    limit = 12,
    search?: string,
    propertyType?: string,
    categoryId?: string,
    status?: string
) {
    const where: any = {};

    const searchValue = search?.trim();

    if (searchValue) {
        where.OR = [
            {
                title: {
                    contains: searchValue,
                },
            },
            {
                address: {
                    contains: searchValue,
                },
            },
            {
                city: {
                    contains: searchValue,
                },
            },
            {
                state: {
                    contains: searchValue,
                },
            },
            {
                property_type: {
                    contains: searchValue,
                },
            },
        ];
    }

    if (propertyType) {
        where.property_type = propertyType;
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (status) {
        where.status = status;
    }

    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                id: 'desc',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                amenities: true,
                images: true,
                category: true,
            },
        }),

        prisma.property.count({
            where,
        }),
    ]);

    return {
        properties,
        total,
    };
}

export async function getPropertyById(id: string) {
    return prisma.property.findUnique({
        where: { id },
        include: {
            owner: true,
            amenities: true,
            images: true,
            category: true,
        },
    });
}

export async function createProperty(data: any, ownerId: string) {
    const amenitiesList = data.amenities;
    delete data.amenities;

    const imagesList = data.images;
    delete data.images;

    /*
     * Normalize date fields.
     */
    if (data.availableFrom) {
        data.availableFrom = normalizeDate(data.availableFrom);
    }

    if (data.availableTo) {
        data.availableTo = normalizeDate(data.availableTo);
    }

    /*
     * Normalize Google Maps coordinates.
     *
     * These are nullable because a property does not have to
     * have coordinates yet.
     */
    if (data.latitude !== undefined) {
        data.latitude = normalizeLatitude(data.latitude);
    }

    if (data.longitude !== undefined) {
        data.longitude = normalizeLongitude(data.longitude);
    }

    /*
     * Category is a relation.
     */
    const categoryConnect = data.categoryId
        ? {
            connect: {
                id: data.categoryId,
            },
        }
        : undefined;

    if (data.categoryId) {
        delete data.categoryId;
    }

    const property = await prisma.property.create({
        data: {
            ...data,

            category: categoryConnect,

            owner: {
                connect: {
                    id: ownerId,
                },
            },
        },
    });

    /*
     * Create amenities belonging to this property.
     */
    if (amenitiesList && amenitiesList.length > 0) {
        await prisma.amenity.createMany({
            data: amenitiesList.map((a: any) => ({
                ...a,
                propertyId: property.id,
            })),
        });
    }

    /*
     * Create property images.
     */
    if (imagesList && imagesList.length > 0) {
        await prisma.propertyImage.createMany({
            data: imagesList.map((img: any) => ({
                ...img,
                propertyId: property.id,
            })),
        });
    }

    return prisma.property.findUnique({
        where: {
            id: property.id,
        },
        include: {
            amenities: true,
            images: true,
            owner: true,
            category: true,
        },
    });
}

export async function updateProperty(id: string, data: any) {
    /*
     * Separate non-core fields.
     */
    const imagesArr = data.images;
    const videosArr = data.videos;
    const amenitiesArr = data.amenities;

    delete data.images;
    delete data.videos;
    delete data.amenities;

    /*
     * Normalize date fields.
     */
    if (data.availableFrom !== undefined) {
        data.availableFrom = normalizeDate(data.availableFrom) ?? null;
    }

    /*
     * availableTo is intentionally nullable.
     *
     * Permanent property:
     * availableTo = null
     *
     * Temporary property:
     * availableTo = selected date
     */
    if (data.availableTo !== undefined) {
        data.availableTo = normalizeDate(data.availableTo) ?? null;
    }

    /*
     * Normalize Google Maps coordinates.
     */
    if (data.latitude !== undefined) {
        data.latitude = normalizeLatitude(data.latitude);
    }

    if (data.longitude !== undefined) {
        data.longitude = normalizeLongitude(data.longitude);
    }

    /*
     * Handle category relation.
     */
    if (data.categoryId !== undefined) {
        const categoryId = data.categoryId;

        delete data.categoryId;

        if (categoryId) {
            data.category = {
                connect: {
                    id: categoryId,
                },
            };
        } else {
            data.category = {
                disconnect: true,
            };
        }
    }

    /*
     * Update core property fields.
     */
    await prisma.property.update({
        where: {
            id,
        },
        data,
    });

    /*
     * Sync images.
     */
    if (Array.isArray(imagesArr)) {
        await syncImages(id, imagesArr);
    }

    /*
     * Sync videos.
     */
    if (Array.isArray(videosArr)) {
        await syncVideos(id, videosArr);
    }

    /*
     * Sync amenities.
     */
    if (Array.isArray(amenitiesArr)) {
        await syncAmenities(id, amenitiesArr);
    }

    return prisma.property.findUnique({
        where: {
            id,
        },
        include: {
            amenities: true,
            images: true,
            owner: true,
            category: true,
        },
    });
}

async function syncImages(
    propertyId: string,
    incomingImages: any[]
) {
    const existing = await prisma.propertyImage.findMany({
        where: {
            propertyId,
        },
    });

    const existingMap = new Map(
        existing.map((img) => [img.id, img])
    );

    const idsToAdd: string[] = [];
    const idsToRemove: string[] = [];

    const incomingIds = new Set<string>();

    for (const img of incomingImages) {
        incomingIds.add(img.id);

        if (!existingMap.has(img.id)) {
            idsToAdd.push(img.id);
        }
    }

    for (const img of existing) {
        if (!incomingIds.has(img.id)) {
            idsToRemove.push(img.id);
        }
    }

    if (idsToAdd.length > 0) {
        await prisma.propertyImage.createMany({
            data: incomingImages
                .filter((img) => idsToAdd.includes(img.id))
                .map((img) => ({
                    ...img,
                    propertyId,
                })),
        });
    }

    if (idsToRemove.length > 0) {
        await prisma.propertyImage.deleteMany({
            where: {
                id: {
                    in: idsToRemove,
                },
            },
        });
    }
}

async function syncVideos(
    propertyId: string,
    incomingVideos: any[]
) {
    const existing = await prisma.propertyImage.findMany({
        where: {
            propertyId,
            type: 'video',
        },
    });

    const existingMap = new Map(
        existing.map((vid) => [vid.id, vid])
    );

    const incomingIds = new Set<string>();

    const idsToAdd: string[] = [];
    const idsToRemove: string[] = [];

    for (const vid of incomingVideos) {
        incomingIds.add(vid.id);

        if (!existingMap.has(vid.id)) {
            idsToAdd.push(vid.id);
        }
    }

    for (const vid of existing) {
        if (!incomingIds.has(vid.id)) {
            idsToRemove.push(vid.id);
        }
    }

    if (idsToAdd.length > 0) {
        await prisma.propertyImage.createMany({
            data: incomingVideos
                .filter((v) => idsToAdd.includes(v.id))
                .map((v) => ({
                    ...v,
                    propertyId,
                    type: 'video',
                })),
        });
    }

    if (idsToRemove.length > 0) {
        await prisma.propertyImage.deleteMany({
            where: {
                id: {
                    in: idsToRemove,
                },
            },
        });
    }
}

async function syncAmenities(
    propertyId: string,
    incomingAmenities: any[]
) {
    const existing = await prisma.amenity.findMany({
        where: {
            propertyId,
        },
    });

    const existingMap = new Map(
        existing.map((a) => [a.id, a])
    );

    const incomingIds = new Set<string>();

    const toCreate: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: string[] = [];

    for (const a of incomingAmenities) {
        incomingIds.add(a.id);

        if (existingMap.has(a.id)) {
            toUpdate.push(a);
        } else {
            toCreate.push({
                ...a,
                propertyId,
            });
        }
    }

    for (const a of existing) {
        if (!incomingIds.has(a.id)) {
            toDelete.push(a.id);
        }
    }

    /*
     * Update existing amenities.
     */
    if (toUpdate.length > 0) {
        for (const a of toUpdate) {
            await prisma.amenity.update({
                where: {
                    id: a.id,
                },
                data: {
                    name: a.name,
                    description: a.description,
                },
            });
        }
    }

    /*
     * Create new property-specific amenities.
     */
    if (toCreate.length > 0) {
        await prisma.amenity.createMany({
            data: toCreate,
        });
    }

    /*
     * Remove deleted amenities.
     */
    if (toDelete.length > 0) {
        await prisma.amenity.deleteMany({
            where: {
                id: {
                    in: toDelete,
                },
            },
        });
    }
}

export async function deactivateProperty(id: string) {
    return prisma.property.update({
        where: {
            id,
        },
        data: {
            status: 'INACTIVE',
        },
    });
}

export async function addImage(
    propertyId: string,
    url: string,
    thumbnailUrl?: string
) {
    return prisma.propertyImage.create({
        data: {
            propertyId,
            url,
            thumbnailUrl: thumbnailUrl || undefined,
            type: 'image',
        },
    });
}

export async function getImageById(imageId: string) {
    return prisma.propertyImage.findUnique({
        where: {
            id: imageId,
        },
    });
}

export async function deleteImage(imageId: string) {
    return prisma.propertyImage.delete({
        where: {
            id: imageId,
        },
    });
}

export async function addVideoToProperty(
    propertyId: string,
    url: string
) {
    const prop = await prisma.property.findUnique({
        where: {
            id: propertyId,
        },
        select: {
            videoUrls: true,
        },
    });

    if (!prop) {
        throw new Error('Property not found');
    }

    const urls: string[] =
        (prop.videoUrls as string[]) || [];

    urls.push(url);

    return prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            videoUrls: urls as any,
        },
    });
}

export async function removeVideoFromProperty(
    propertyId: string,
    url: string
) {
    const prop = await prisma.property.findUnique({
        where: {
            id: propertyId,
        },
        select: {
            videoUrls: true,
        },
    });

    if (!prop) {
        throw new Error('Property not found');
    }

    const urls: string[] =
        (prop.videoUrls as string[]) || [];

    if (!urls.includes(url)) {
        return null;
    }

    return prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            videoUrls: urls.filter(
                (u: string) => u !== url
            ) as any,
        },
    });
}

export async function addDocumentToProperty(
    propertyId: string,
    url: string
) {
    const prop = await prisma.property.findUnique({
        where: {
            id: propertyId,
        },
        select: {
            documentUrls: true,
        },
    });

    if (!prop) {
        throw new Error('Property not found');
    }

    const urls: string[] =
        (prop.documentUrls as string[]) || [];

    urls.push(url);

    return prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            documentUrls: urls as any,
        },
    });
}

export async function removeDocumentFromProperty(
    propertyId: string,
    url: string
) {
    const prop = await prisma.property.findUnique({
        where: {
            id: propertyId,
        },
        select: {
            documentUrls: true,
        },
    });

    if (!prop) {
        throw new Error('Property not found');
    }

    const urls: string[] =
        (prop.documentUrls as string[]) || [];

    if (!urls.includes(url)) {
        return null;
    }

    return prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            documentUrls: urls.filter(
                (u: string) => u !== url
            ) as any,
        },
    });
}

export async function getLandlordProperties(
    landlordId: string
) {
    const properties =
        await prisma.property.findMany({
            where: {
                ownerId: landlordId,
            },
            include: {
                amenities: true,
                images: true,
                category: true,
                agentProperties: {
                    include: {
                        agent: true,
                    },
                },
            },
        });

    return properties.map((p) => ({
        ...p,

        agentProperties:
            p.agentProperties.map(
                (ap) => ap.agent
            ),
    }));
}
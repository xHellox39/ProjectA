"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDate = normalizeDate;
exports.getAllProperties = getAllProperties;
exports.searchProperties = searchProperties;
exports.getPropertyById = getPropertyById;
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.deactivateProperty = deactivateProperty;
exports.addImage = addImage;
exports.getImageById = getImageById;
exports.deleteImage = deleteImage;
exports.addVideoToProperty = addVideoToProperty;
exports.removeVideoFromProperty = removeVideoFromProperty;
exports.addDocumentToProperty = addDocumentToProperty;
exports.removeDocumentFromProperty = removeDocumentFromProperty;
exports.getLandlordProperties = getLandlordProperties;
const db_1 = require("../../db");
/** Convert date-only strings (YYYY-MM-DD) to Date objects for Prisma DateTime fields */
function normalizeDate(val) {
    if (!val)
        return undefined;
    if (val instanceof Date)
        return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
}
/**
 * Validate and normalize latitude.
 * Latitude must be between -90 and 90.
 */
function normalizeLatitude(val) {
    if (val === undefined)
        return undefined;
    if (val === null || val === '')
        return null;
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
function normalizeLongitude(val) {
    if (val === undefined)
        return undefined;
    if (val === null || val === '')
        return null;
    const number = Number(val);
    if (!Number.isFinite(number)) {
        throw new Error('Invalid longitude');
    }
    if (number < -180 || number > 180) {
        throw new Error('Longitude must be between -180 and 180');
    }
    return number;
}
async function getAllProperties(page = 1, limit = 10) {
    const [properties, total] = await Promise.all([
        db_1.prisma.property.findMany({
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
        db_1.prisma.property.count(),
    ]);
    return {
        properties,
        total,
    };
}
/**
 * Search/filter properties.
 */
async function searchProperties(page = 1, limit = 12, search, propertyType, categoryId, status) {
    const where = {};
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
        db_1.prisma.property.findMany({
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
        db_1.prisma.property.count({
            where,
        }),
    ]);
    return {
        properties,
        total,
    };
}
async function getPropertyById(id) {
    return db_1.prisma.property.findUnique({
        where: { id },
        include: {
            owner: true,
            amenities: true,
            images: true,
            category: true,
        },
    });
}
async function createProperty(data, ownerId) {
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
    const property = await db_1.prisma.property.create({
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
        await db_1.prisma.amenity.createMany({
            data: amenitiesList.map((a) => ({
                ...a,
                propertyId: property.id,
            })),
        });
    }
    /*
     * Create property images.
     */
    if (imagesList && imagesList.length > 0) {
        await db_1.prisma.propertyImage.createMany({
            data: imagesList.map((img) => ({
                ...img,
                propertyId: property.id,
            })),
        });
    }
    return db_1.prisma.property.findUnique({
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
async function updateProperty(id, data) {
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
        }
        else {
            data.category = {
                disconnect: true,
            };
        }
    }
    /*
     * Update core property fields.
     */
    await db_1.prisma.property.update({
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
    return db_1.prisma.property.findUnique({
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
async function syncImages(propertyId, incomingImages) {
    const existing = await db_1.prisma.propertyImage.findMany({
        where: {
            propertyId,
        },
    });
    const existingMap = new Map(existing.map((img) => [img.id, img]));
    const idsToAdd = [];
    const idsToRemove = [];
    const incomingIds = new Set();
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
        await db_1.prisma.propertyImage.createMany({
            data: incomingImages
                .filter((img) => idsToAdd.includes(img.id))
                .map((img) => ({
                ...img,
                propertyId,
            })),
        });
    }
    if (idsToRemove.length > 0) {
        await db_1.prisma.propertyImage.deleteMany({
            where: {
                id: {
                    in: idsToRemove,
                },
            },
        });
    }
}
async function syncVideos(propertyId, incomingVideos) {
    const existing = await db_1.prisma.propertyImage.findMany({
        where: {
            propertyId,
            type: 'video',
        },
    });
    const existingMap = new Map(existing.map((vid) => [vid.id, vid]));
    const incomingIds = new Set();
    const idsToAdd = [];
    const idsToRemove = [];
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
        await db_1.prisma.propertyImage.createMany({
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
        await db_1.prisma.propertyImage.deleteMany({
            where: {
                id: {
                    in: idsToRemove,
                },
            },
        });
    }
}
async function syncAmenities(propertyId, incomingAmenities) {
    const existing = await db_1.prisma.amenity.findMany({
        where: {
            propertyId,
        },
    });
    const existingMap = new Map(existing.map((a) => [a.id, a]));
    const incomingIds = new Set();
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];
    for (const a of incomingAmenities) {
        incomingIds.add(a.id);
        if (existingMap.has(a.id)) {
            toUpdate.push(a);
        }
        else {
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
            await db_1.prisma.amenity.update({
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
        await db_1.prisma.amenity.createMany({
            data: toCreate,
        });
    }
    /*
     * Remove deleted amenities.
     */
    if (toDelete.length > 0) {
        await db_1.prisma.amenity.deleteMany({
            where: {
                id: {
                    in: toDelete,
                },
            },
        });
    }
}
async function deactivateProperty(id) {
    return db_1.prisma.property.update({
        where: {
            id,
        },
        data: {
            status: 'INACTIVE',
        },
    });
}
async function addImage(propertyId, url, thumbnailUrl) {
    return db_1.prisma.propertyImage.create({
        data: {
            propertyId,
            url,
            thumbnailUrl: thumbnailUrl || undefined,
            type: 'image',
        },
    });
}
async function getImageById(imageId) {
    return db_1.prisma.propertyImage.findUnique({
        where: {
            id: imageId,
        },
    });
}
async function deleteImage(imageId) {
    return db_1.prisma.propertyImage.delete({
        where: {
            id: imageId,
        },
    });
}
async function addVideoToProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({
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
    const urls = prop.videoUrls || [];
    urls.push(url);
    return db_1.prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            videoUrls: urls,
        },
    });
}
async function removeVideoFromProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({
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
    const urls = prop.videoUrls || [];
    if (!urls.includes(url)) {
        return null;
    }
    return db_1.prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            videoUrls: urls.filter((u) => u !== url),
        },
    });
}
async function addDocumentToProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({
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
    const urls = prop.documentUrls || [];
    urls.push(url);
    return db_1.prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            documentUrls: urls,
        },
    });
}
async function removeDocumentFromProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({
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
    const urls = prop.documentUrls || [];
    if (!urls.includes(url)) {
        return null;
    }
    return db_1.prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            documentUrls: urls.filter((u) => u !== url),
        },
    });
}
async function getLandlordProperties(landlordId) {
    const properties = await db_1.prisma.property.findMany({
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
        agentProperties: p.agentProperties.map((ap) => ap.agent),
    }));
}

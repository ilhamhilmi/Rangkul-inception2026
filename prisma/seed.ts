import { PrismaClient, type FeatureValue, type PlaceCategory } from "@prisma/client";
import { SEED_FEATURES, SEED_PLACES } from "./seed-data";

const prisma = new PrismaClient();

async function seedProfiles() {
  const people = new Map<string, string>();

  const contributors = SEED_PLACES.map((place) => place.contributor);
  const reviewers = SEED_PLACES.flatMap((place) =>
    place.reviews.map((review) => ({
      name: review.author,
      email: review.email,
    })),
  );

  for (const person of [...contributors, ...reviewers]) {
    const profile = await prisma.profile.upsert({
      where: { email: person.email },
      update: { name: person.name },
      create: {
        id: crypto.randomUUID(),
        email: person.email,
        name: person.name,
      },
    });

    people.set(profile.email, profile.id);
  }

  return people;
}

async function seedFeatures() {
  const features = new Map<string, string>();

  for (const feature of SEED_FEATURES) {
    const row = await prisma.accessibilityFeature.upsert({
      where: { key: feature.key },
      update: {
        label: feature.label,
        shortLabel: feature.shortLabel,
        category: feature.category,
        icon: feature.icon,
        description: feature.description,
        sortOrder: feature.sortOrder,
        isActive: true,
      },
      create: {
        id: crypto.randomUUID(),
        key: feature.key,
        label: feature.label,
        shortLabel: feature.shortLabel,
        category: feature.category,
        icon: feature.icon,
        description: feature.description,
        sortOrder: feature.sortOrder,
      },
    });

    features.set(row.key, row.id);
  }

  return features;
}

async function seedPlaces(profileIds: Map<string, string>, featureIds: Map<string, string>) {
  for (const data of SEED_PLACES) {
    const createdById = profileIds.get(data.contributor.email);

    if (!createdById) {
      throw new Error(`Profil kontributor tidak ditemukan: ${data.contributor.email}`);
    }

    const publishedAt = new Date("2026-09-01T09:00:00Z");

    const place = await prisma.place.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        category: data.category as PlaceCategory,
        description: data.description,
        address: data.address,
        city: data.city,
        province: data.province,
        latitude: data.latitude,
        longitude: data.longitude,
        status: "PUBLISHED",
        createdById,
        defaultOriginLabel: data.defaultOrigin.label,
        defaultOriginLatitude: data.defaultOrigin.latitude,
        defaultOriginLongitude: data.defaultOrigin.longitude,
        publishedAt,
        archivedAt: null,
      },
      create: {
        id: crypto.randomUUID(),
        slug: data.slug,
        name: data.name,
        category: data.category as PlaceCategory,
        description: data.description,
        address: data.address,
        city: data.city,
        province: data.province,
        latitude: data.latitude,
        longitude: data.longitude,
        status: "PUBLISHED",
        createdById,
        defaultOriginLabel: data.defaultOrigin.label,
        defaultOriginLatitude: data.defaultOrigin.latitude,
        defaultOriginLongitude: data.defaultOrigin.longitude,
        publishedAt,
      },
    });

    for (const entranceData of data.entrances) {
      const existing = await prisma.entrance.findFirst({
        where: { placeId: place.id, label: entranceData.label },
      });

      const entrance = existing
        ? await prisma.entrance.update({
            where: { id: existing.id },
            data: {
              notes: entranceData.notes,
              latitude: entranceData.latitude,
              longitude: entranceData.longitude,
              isMain: entranceData.isMain,
              routeDistanceM: entranceData.routeDistanceM,
              routeDurationMin: entranceData.routeDurationMin,
              routeCondition: entranceData.routeCondition,
              routeSteps: entranceData.routeSteps,
            },
          })
        : await prisma.entrance.create({
            data: {
              id: crypto.randomUUID(),
              placeId: place.id,
              label: entranceData.label,
              notes: entranceData.notes,
              latitude: entranceData.latitude,
              longitude: entranceData.longitude,
              isMain: entranceData.isMain,
              routeDistanceM: entranceData.routeDistanceM,
              routeDurationMin: entranceData.routeDurationMin,
              routeCondition: entranceData.routeCondition,
              routeSteps: entranceData.routeSteps,
            },
          });

      for (const featureKey of featureIds.keys()) {
        const featureId = featureIds.get(featureKey);

        if (!featureId) continue;

        let value: FeatureValue = "UNKNOWN";

        if (entranceData.available.includes(featureKey)) {
          value = "AVAILABLE";
        } else if (entranceData.unavailable.includes(featureKey)) {
          value = "NOT_AVAILABLE";
        }

        await prisma.entranceFeature.upsert({
          where: {
            entranceId_featureId: {
              entranceId: entrance.id,
              featureId,
            },
          },
          update: { value },
          create: {
            id: crypto.randomUUID(),
            entranceId: entrance.id,
            featureId,
            value,
          },
        });
      }
    }

    for (const reviewData of data.reviews) {
      const authorId = profileIds.get(reviewData.email);

      if (!authorId) {
        throw new Error(`Profil penulis review tidak ditemukan: ${reviewData.email}`);
      }

      const existing = await prisma.review.findFirst({
        where: { placeId: place.id, authorId },
      });

      const reviewPayload = {
        rating: reviewData.rating,
        body: reviewData.body,
        accessibilityNote: reviewData.accessibilityNote ?? null,
        status: "PUBLISHED" as const,
        publishedAt: new Date(`${reviewData.date}T09:00:00Z`),
        archivedAt: null,
      };

      if (existing) {
        await prisma.review.update({
          where: { id: existing.id },
          data: reviewPayload,
        });
      } else {
        await prisma.review.create({
          data: {
            id: crypto.randomUUID(),
            placeId: place.id,
            authorId,
            ...reviewPayload,
          },
        });
      }
    }

    const summary = await prisma.place.findUnique({
      where: { id: place.id },
      select: { ratingAvg: true, reviewCount: true },
    });

    console.log(
      `✓ ${data.name} — ${data.entrances.length} pintu, ${summary?.reviewCount ?? 0} review, rating ${summary?.ratingAvg ?? 0}`,
    );
  }
}

async function main() {
  console.log("Seeding Fitur 1: fasilitas, profil, tempat, pintu, dan review…");

  const profileIds = await seedProfiles();
  const featureIds = await seedFeatures();

  await seedPlaces(profileIds, featureIds);

  console.log(
    `Selesai: ${SEED_PLACES.length} tempat, ${SEED_FEATURES.length} fasilitas aksesibilitas.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

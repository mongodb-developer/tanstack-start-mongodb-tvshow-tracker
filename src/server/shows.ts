import { createServerFn } from "@tanstack/react-start";
import { ObjectId } from "mongodb";
import { getShowsCollection } from "~/lib/mongodb";
import { getShowDetails } from "~/lib/tmdb";
import {
  addShowSchema,
  documentToShow,
  showIdSchema,
  updateShowSchema,
  type LibraryStats,
  type Show,
  type ShowDocument,
} from "~/lib/types";

export const getShows = createServerFn({ method: "GET" }).handler(
  async (): Promise<Show[]> => {
    try {
      const collection = await getShowsCollection();
      const docs = await collection.find({}).sort({ updatedAt: -1 }).toArray();
      return docs.map(documentToShow);
    } catch (error) {
      console.error("Error fetching shows:", error);
      throw new Error("Failed to fetch shows");
    }
  }
);

export const getStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<LibraryStats> => {
    try {
      const collection = await getShowsCollection();

      const [result] = await collection
        .aggregate<LibraryStats>([
          {
            $group: {
              _id: null,
              totalShows: { $sum: 1 },
              episodesWatched: { $sum: "$episodesWatched" },
              watching: {
                $sum: { $cond: [{ $eq: ["$status", "watching"] }, 1, 0] },
              },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
              planToWatch: {
                $sum: { $cond: [{ $eq: ["$status", "plan_to_watch"] }, 1, 0] },
              },
            },
          },
          { $project: { _id: 0 } },
        ])
        .toArray();

      return (
        result ?? {
          totalShows: 0,
          episodesWatched: 0,
          watching: 0,
          completed: 0,
          planToWatch: 0,
        }
      );
    } catch (error) {
      console.error("Error building stats:", error);
      throw new Error("Failed to build stats");
    }
  }
);

export const addShow = createServerFn({ method: "POST" })
  .validator(addShowSchema)
  .handler(async ({ data }): Promise<Show> => {
    try {
      const collection = await getShowsCollection();

      const existing = await collection.findOne({ tmdbId: data.tmdbId });
      if (existing) {
        return documentToShow(existing);
      }

      const details = await getShowDetails(data.tmdbId);
      const now = new Date();

      const newShow: ShowDocument = {
        tmdbId: details.tmdbId,
        title: details.title,
        posterPath: details.posterPath,
        totalSeasons: details.totalSeasons,
        totalEpisodes: details.totalEpisodes,
        episodesWatched: 0,
        status: data.status,
        rating: null,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(newShow);
      const created = await collection.findOne({ _id: result.insertedId });
      if (!created) {
        throw new Error("Show was added but could not be retrieved");
      }

      return documentToShow(created);
    } catch (error) {
      console.error("Error adding show:", error);
      throw new Error("Failed to add show");
    }
  });

export const updateShow = createServerFn({ method: "POST" })
  .validator(updateShowSchema)
  .handler(async ({ data }): Promise<Show> => {
    try {
      const collection = await getShowsCollection();

      const updateFields: Partial<ShowDocument> = {
        updatedAt: new Date(),
      };
      if (data.status !== undefined) updateFields.status = data.status;
      if (data.rating !== undefined) updateFields.rating = data.rating;
      if (data.episodesWatched !== undefined) {
        updateFields.episodesWatched = data.episodesWatched;
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(data.id) },
        { $set: updateFields },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Show not found");
      }

      return documentToShow(result);
    } catch (error) {
      console.error("Error updating show:", error);
      throw new Error("Failed to update show");
    }
  });

export const incrementProgress = createServerFn({ method: "POST" })
  .validator(showIdSchema)
  .handler(async ({ data }): Promise<Show> => {
    try {
      const collection = await getShowsCollection();

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(data.id) },
        [
          {
            $set: {
              episodesWatched: {
                $min: [{ $add: ["$episodesWatched", 1] }, "$totalEpisodes"],
              },
              updatedAt: "$$NOW",
            },
          },
          {
            $set: {
              status: {
                $cond: [
                  { $gte: ["$episodesWatched", "$totalEpisodes"] },
                  "completed",
                  "watching",
                ],
              },
            },
          },
        ],
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Show not found");
      }

      return documentToShow(result);
    } catch (error) {
      console.error("Error updating progress:", error);
      throw new Error("Failed to update progress");
    }
  });

export const deleteShow = createServerFn({ method: "POST" })
  .validator(showIdSchema)
  .handler(async ({ data }): Promise<{ success: true }> => {
    try {
      const collection = await getShowsCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(data.id) });

      if (result.deletedCount === 0) {
        throw new Error("Show not found");
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting show:", error);
      throw new Error("Failed to delete show");
    }
  });

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Add or update a single item (link or folder).
 * Uses the app-level `id` field to upsert.
 */
export const upsertItem = mutation({
  args: {
    id: v.string(),
    type: v.union(v.literal("link"), v.literal("link-folder")),
    title: v.string(),
    path: v.string(),
    url: v.optional(v.string()),
    icon_url: v.optional(v.string()),
    dimentions: v.optional(
      v.array(
        v.object({
          id: v.string(),
          value: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.tokenIdentifier;

    // Check if item already exists for this user
    const existing = await ctx.db
      .query("items")
      .withIndex("by_userId_and_id", (q) =>
        q.eq("userId", userId).eq("id", args.id)
      )
      .unique();

    if (existing) {
      await ctx.db.patch("items", existing._id, {
        type: args.type,
        title: args.title,
        path: args.path,
        url: args.url,
        icon_url: args.icon_url,
        dimentions: args.dimentions,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("items", {
        userId,
        id: args.id,
        type: args.type,
        title: args.title,
        path: args.path,
        url: args.url,
        icon_url: args.icon_url,
        dimentions: args.dimentions,
      });
    }
  },
});

/**
 * Delete an item by its app-level `id`.
 */
export const deleteItem = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("items")
      .withIndex("by_userId_and_id", (q) =>
        q.eq("userId", userId).eq("id", args.id)
      )
      .unique();

    if (existing) {
      await ctx.db.delete("items", existing._id);
    }
  },
});

/**
 * Add or update a dimention (upsert by app-level `id`).
 */
export const upsertDimention = mutation({
  args: {
    id: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("dimentions")
      .withIndex("by_userId_and_id", (q) =>
        q.eq("userId", userId).eq("id", args.id)
      )
      .unique();

    if (existing) {
      await ctx.db.patch("dimentions", existing._id, {
        title: args.title,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("dimentions", {
        userId,
        id: args.id,
        type: "dimention",
        title: args.title,
      });
    }
  },
});

/**
 * Delete a dimention by its app-level `id`.
 * Also removes all references to this dimention from all items.
 */
export const deleteDimention = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.tokenIdentifier;

    // Delete the dimention document
    const existing = await ctx.db
      .query("dimentions")
      .withIndex("by_userId_and_id", (q) =>
        q.eq("userId", userId).eq("id", args.id)
      )
      .unique();

    if (existing) {
      await ctx.db.delete("dimentions", existing._id);
    }

    // Remove this dimention from all items that reference it
    const allItems = await ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const item of allItems) {
      if (item.dimentions && item.dimentions.some((d) => d.id === args.id)) {
        await ctx.db.patch("items", item._id, {
          dimentions: item.dimentions.filter((d) => d.id !== args.id),
        });
      }
    }
  },
});

/**
 * Bulk replace all data (items + dimentions) for the authenticated user.
 * Used for import/sync operations.
 */
export const importAllData = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        type: v.union(v.literal("link"), v.literal("link-folder")),
        title: v.string(),
        path: v.string(),
        url: v.optional(v.string()),
        icon_url: v.optional(v.string()),
        dimentions: v.optional(
          v.array(
            v.object({
              id: v.string(),
              value: v.number(),
            })
          )
        ),
      })
    ),
    dimentions: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.tokenIdentifier;

    // Delete all existing items and dimentions for this user
    const existingItems = await ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const item of existingItems) {
      await ctx.db.delete("items", item._id);
    }

    const existingDimentions = await ctx.db
      .query("dimentions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const dim of existingDimentions) {
      await ctx.db.delete("dimentions", dim._id);
    }

    // Insert new data
    for (const item of args.items) {
      await ctx.db.insert("items", {
        userId,
        ...item,
      });
    }
    for (const dim of args.dimentions) {
      await ctx.db.insert("dimentions", {
        userId,
        id: dim.id,
        type: "dimention",
        title: dim.title,
      });
    }
  },
});

/**
 * Sync localStorage data to Convex on first login.
 * Only inserts data if the user has no items yet.
 */
export const syncLocalData = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        type: v.union(v.literal("link"), v.literal("link-folder")),
        title: v.string(),
        path: v.string(),
        url: v.optional(v.string()),
        icon_url: v.optional(v.string()),
        dimentions: v.optional(
          v.array(
            v.object({
              id: v.string(),
              value: v.number(),
            })
          )
        ),
      })
    ),
    dimentions: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.tokenIdentifier;

    // Only sync if user has no data yet (first login)
    const existingCount = await ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (existingCount.length > 0) {
      return { synced: false, reason: "User already has data" };
    }

    // Insert local data
    for (const item of args.items) {
      await ctx.db.insert("items", {
        userId,
        ...item,
      });
    }
    for (const dim of args.dimentions) {
      await ctx.db.insert("dimentions", {
        userId,
        id: dim.id,
        type: "dimention",
        title: dim.title,
      });
    }

    return { synced: true };
  },
});
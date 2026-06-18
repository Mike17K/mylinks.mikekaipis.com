import { query } from "./_generated/server";

/**
 * Get all items (links & folders) for the authenticated user.
 * Returns empty array if not authenticated.
 */
export const getAllItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.tokenIdentifier;
    return await ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * Get all dimentions for the authenticated user.
 * Returns empty array if not authenticated.
 */
export const getAllDimentions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.tokenIdentifier;
    return await ctx.db
      .query("dimentions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * Get all data (items + dimentions) for the authenticated user.
 * Returns both arrays. Returns empty arrays if not authenticated.
 */
export const getAllData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { items: [], dimentions: [] };
    }
    const userId = identity.tokenIdentifier;

    const [items, dimentions] = await Promise.all([
      ctx.db
        .query("items")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("dimentions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    return { items, dimentions };
  },
});
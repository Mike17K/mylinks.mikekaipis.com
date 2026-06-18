import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Items (links & folders) are per-user
  items: defineTable({
    userId: v.string(),
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
    .index("by_userId", ["userId"])
    .index("by_userId_and_id", ["userId", "id"]),

  // Dimentions are per-user
  dimentions: defineTable({
    userId: v.string(),
    id: v.string(),
    type: v.literal("dimention"),
    title: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_id", ["userId", "id"]),
});
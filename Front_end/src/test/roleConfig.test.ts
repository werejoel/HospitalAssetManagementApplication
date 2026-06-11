import { describe, expect, it } from "vitest";
import {
  canManageAssetStatus,
  formatRoleLabel,
  getNavItemsForRole,
  normalizeRole,
  routePermissions,
} from "@/lib/roleConfig";

describe("store manager role support", () => {
  it("exposes store manager routes and navigation in the same way as the asset manager role", () => {
    expect(routePermissions["/assets"]).toContain("store_manager");
    expect(routePermissions["/assignments"]).toContain("store_manager");
    expect(getNavItemsForRole("store_manager").some((item) => item.path === "/assets")).toBe(true);
  });

  it("normalizes legacy manager roles to the store manager flow", () => {
    expect(normalizeRole("asset_manager")).toBe("store_manager");
    expect(normalizeRole("store_manager")).toBe("store_manager");
    expect(formatRoleLabel("asset_manager")).toBe("Store Manager");
  });

  it("keeps staff requests from touching asset status permissions", () => {
    expect(canManageAssetStatus("staff")).toBe(false);
    expect(canManageAssetStatus("store_manager")).toBe(true);
  });
});

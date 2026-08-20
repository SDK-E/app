import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addServiceMediaAsset,
  getServiceMediaAssets,
  removeServiceMediaAsset,
} from "@/lib/providers/services/media";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const providerService = {
    findFirst: vi.fn(),
  };
  const serviceMediaAsset = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: {
      providerService,
      serviceMediaAsset,
      auditEvent,
    },
    providerService,
    serviceMediaAsset,
    auditEvent,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));

const baseService = {
  id: "svc-1",
  providerId: "provider-1",
  status: "DRAFT" as const,
  provider: { userId: "user-1" },
};

const baseAsset = {
  id: "asset-1",
  serviceId: "svc-1",
  name: "logo.png",
  storageKey: "key",
  mimeType: "image/png",
  sizeBytes: 1024,
  kind: "IMAGE" as const,
  sortOrder: 0,
  uploadedBy: "user-1",
};

beforeEach(() => {
  for (const mock of [
    mocks.providerService.findFirst,
    mocks.serviceMediaAsset.findFirst,
    mocks.serviceMediaAsset.findMany,
    mocks.serviceMediaAsset.create,
    mocks.serviceMediaAsset.delete,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("addServiceMediaAsset", () => {
  it("adds asset to draft service", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    mocks.serviceMediaAsset.create.mockResolvedValue(baseAsset);

    const asset = await addServiceMediaAsset(principal("provider"), "svc-1", {
      name: "logo.png",
      storageKey: "key",
      mimeType: "image/png",
      sizeBytes: 1024,
      kind: "IMAGE",
      sortOrder: 0,
    });

    expect(asset).toEqual(baseAsset);
    expect(mocks.serviceMediaAsset.create).toHaveBeenCalledWith({
      data: {
        serviceId: "svc-1",
        name: "logo.png",
        storageKey: "key",
        mimeType: "image/png",
        sizeBytes: 1024,
        kind: "IMAGE",
        sortOrder: 0,
        uploadedBy: "user-1",
      },
    });
  });

  it("throws for published service", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "PUBLISHED",
    });

    await expect(
      addServiceMediaAsset(principal("provider"), "svc-1", {
        name: "logo.png",
        storageKey: "key",
        mimeType: "image/png",
        sizeBytes: 1024,
        kind: "IMAGE",
        sortOrder: 0,
      })
    ).rejects.toThrow("Media can only be added to draft or rejected services.");
  });
});

describe("removeServiceMediaAsset", () => {
  it("removes asset from draft service", async () => {
    mocks.serviceMediaAsset.findFirst.mockResolvedValue({
      ...baseAsset,
      service: baseService,
    });

    await removeServiceMediaAsset(principal("provider"), "asset-1");

    expect(mocks.serviceMediaAsset.delete).toHaveBeenCalledWith({
      where: { id: "asset-1" },
    });
  });

  it("throws for published service", async () => {
    mocks.serviceMediaAsset.findFirst.mockResolvedValue({
      ...baseAsset,
      service: { ...baseService, status: "PUBLISHED" },
    });

    await expect(removeServiceMediaAsset(principal("provider"), "asset-1")).rejects.toThrow(
      "Media can only be removed from draft or rejected services."
    );
  });
});

describe("getServiceMediaAssets", () => {
  it("returns assets for provider", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    mocks.serviceMediaAsset.findMany.mockResolvedValue([baseAsset]);

    const assets = await getServiceMediaAssets(principal("provider"), "svc-1");

    expect(assets).toEqual([baseAsset]);
    expect(mocks.serviceMediaAsset.findMany).toHaveBeenCalledWith({
      where: { serviceId: "svc-1" },
      orderBy: { sortOrder: "asc" },
    });
  });

  it("returns assets for sdk staff", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    mocks.serviceMediaAsset.findMany.mockResolvedValue([baseAsset]);

    const assets = await getServiceMediaAssets(principal("sdk-admin"), "svc-1");

    expect(assets).toEqual([baseAsset]);
  });

  it("blocks unauthenticated access", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);

    await expect(getServiceMediaAssets(principal("owner"), "svc-1")).rejects.toThrow(
      "Service not found."
    );
  });
});

import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { brand } from "@/config/brand";
import type { PropertyInput } from "@/lib/domain/property";
import { createDemoRepository, type DemoRepository } from "./repository";
import { DEMO_USERS } from "./session";

const input: PropertyInput = {
  title: "Piso de prueba con dos dormitorios",
  description: "Descripción de prueba suficientemente larga para pasar la validación.",
  operation: "venta",
  type: "piso",
  price: 150000,
  builtArea: 80,
  bedrooms: 2,
  bathrooms: 1,
  energyRating: "D",
  zone: "Centro",
  city: "Guadalajara",
  published: true,
};

const image = (bytes = 1000) => new Blob([new Uint8Array(bytes)], { type: "image/webp" });
const video = (bytes = 1000) => new Blob([new Uint8Array(bytes)], { type: "video/mp4" });

let repo: DemoRepository;
let actor = DEMO_USERS[0];

beforeEach(() => {
  actor = DEMO_USERS[0];
  repo = createDemoRepository({ getActor: () => actor, dbName: `test-${crypto.randomUUID()}` });
});

describe("datos de ejemplo", () => {
  it("carga los inmuebles de ejemplo", async () => {
    const all = await repo.listProperties();
    expect(all.length).toBe(8);
    expect(all.filter((p) => p.operation === "alquiler")).toHaveLength(1);
  });

  it("reset vuelve al estado inicial", async () => {
    await repo.createProperty(input);
    await repo.reset();
    expect(await repo.listProperties()).toHaveLength(8);
  });
});

describe("inmuebles", () => {
  it("crea con referencia y slug únicos", async () => {
    const p = await repo.createProperty(input);
    expect(p.reference).toBe(`${brand.referencePrefix}-0009`);
    expect(p.slug).toBe("piso-de-prueba-con-dos-dormitorios-cb-0009");
    expect(await repo.getPropertyBySlug(p.slug)).toMatchObject({ id: p.id });
  });

  it("rechaza datos no válidos con mensaje en español", async () => {
    await expect(repo.createProperty({ ...input, title: "Corto" })).rejects.toThrow(/al menos 10/);
  });

  it("filtra y ordena", async () => {
    const sale = await repo.listProperties({ operation: "venta", sort: "price_asc" });
    expect(sale.every((p) => p.operation === "venta")).toBe(true);
    expect(sale.map((p) => p.price)).toEqual([...sale.map((p) => p.price)].sort((a, b) => a - b));
    expect(await repo.listProperties({ search: "atico" })).toHaveLength(1);
  });

  it("borrado blando y restaurar", async () => {
    const p = await repo.createProperty(input);
    await repo.deleteProperty(p.id);
    expect((await repo.listProperties()).find((x) => x.id === p.id)).toBeUndefined();
    expect(await repo.listProperties({ onlyDeleted: true })).toHaveLength(1);
    expect(await repo.getPropertyBySlug(p.slug)).toBeNull();
    await repo.restoreProperty(p.id);
    expect((await repo.listProperties()).find((x) => x.id === p.id)).toBeDefined();
  });
});

describe("precio y estado", () => {
  it("aplica y quita rebaja", async () => {
    const p = await repo.createProperty(input);
    const dropped = await repo.applyPriceDrop(p.id, 140000);
    expect(dropped).toMatchObject({ price: 140000, previousPrice: 150000 });
    expect(dropped.priceHistory).toHaveLength(1);
    const cleared = await repo.removePriceDrop(p.id);
    expect(cleared).toMatchObject({ price: 140000, previousPrice: null });
  });

  it("no deja rebajar a un precio mayor o igual", async () => {
    const p = await repo.createProperty(input);
    await expect(repo.applyPriceDrop(p.id, 150000)).rejects.toThrow(/menor/);
  });

  it("subir el precio por encima del anterior quita la rebaja", async () => {
    const p = await repo.createProperty(input);
    await repo.applyPriceDrop(p.id, 140000);
    const up = await repo.updateProperty(p.id, { price: 155000 });
    expect(up.previousPrice).toBeNull();
  });

  it("vendido solo para venta, alquilado solo para alquiler", async () => {
    const p = await repo.createProperty(input);
    await expect(repo.setStatus(p.id, "alquilado")).rejects.toThrow(/vendido/);
    const sold = await repo.setStatus(p.id, "vendido");
    expect(sold.closedAt).not.toBeNull();
    const back = await repo.setStatus(p.id, "disponible");
    expect(back.closedAt).toBeNull();
  });
});

describe("fotos y vídeo", () => {
  it("añade, reordena y quita archivos", async () => {
    const p = await repo.createProperty(input);
    const withMedia = await repo.addMedia(p.id, [
      { file: image(), name: "a.webp" },
      { file: image(), name: "b.webp" },
    ]);
    expect(withMedia.media.map((m) => m.position)).toEqual([0, 1]);
    const [a, b] = withMedia.media;
    const reordered = await repo.reorderMedia(p.id, [b.id, a.id]);
    expect(reordered.media.find((m) => m.id === b.id)?.position).toBe(0);
    expect(await repo.mediaUrl(a.path, a.source)).toMatch(/^blob:/);
    const removed = await repo.removeMedia(p.id, b.id);
    expect(removed.media).toHaveLength(1);
    expect(removed.media[0].position).toBe(0);
  });

  it(`máximo ${brand.media.maxPhotos} fotos y ${brand.media.maxVideos} vídeo`, async () => {
    const p = await repo.createProperty(input);
    const photos = Array.from({ length: brand.media.maxPhotos }, (_, i) => ({ file: image(10), name: `${i}.webp` }));
    await repo.addMedia(p.id, photos);
    await expect(repo.addMedia(p.id, [{ file: image(10), name: "extra.webp" }])).rejects.toThrow(/fotos/);
    await repo.addMedia(p.id, [{ file: video(10), name: "v.mp4" }]);
    await expect(repo.addMedia(p.id, [{ file: video(10), name: "v2.mp4" }])).rejects.toThrow(/vídeo/);
  });

  it("rechaza archivos pesados o de formato no admitido", async () => {
    const p = await repo.createProperty(input);
    const big = image(brand.media.maxPhotoMB * 1024 * 1024 + 1);
    await expect(repo.addMedia(p.id, [{ file: big, name: "big.webp" }])).rejects.toThrow(/MB/);
    const pdf = new Blob(["x"], { type: "application/pdf" });
    await expect(repo.addMedia(p.id, [{ file: pdf, name: "doc.pdf" }])).rejects.toThrow(/Formato/);
  });
});

describe("contactos", () => {
  const lead = {
    name: "Ana López",
    email: "ana@example.com",
    message: "Me interesa visitar el piso esta semana.",
    consent: true as const,
  };

  it("guarda el mensaje con el inmueble y sin el campo trampa", async () => {
    const saved = await repo.createLead({ ...lead, propertyId: "demo-1", reason: "visita" });
    expect(saved).toMatchObject({ status: "nuevo", propertyLabel: expect.stringContaining("CB-0001") });
    expect(saved).not.toHaveProperty("website");
    const [first] = await repo.listLeads();
    expect(first.id).toBe(saved.id);
    expect((await repo.setLeadStatus(saved.id, "atendido")).status).toBe("atendido");
  });

  it("exige consentimiento y bloquea bots", async () => {
    await expect(repo.createLead({ ...lead, consent: false as unknown as true })).rejects.toThrow(/permiso/);
    await expect(repo.createLead({ ...lead, website: "http://spam" })).rejects.toThrow();
  });
});

describe("contenido editable", () => {
  it("borrador → publicar, guardando solo lo que cambia y dejando rastro", async () => {
    await repo.saveContentDraft({
      "home.title": "Tu casa en Guadalajara",
      "home.eyebrow": "Inmobiliaria en Guadalajara",
    });
    let state = await repo.getContentState();
    expect(state.published).toEqual({});
    expect(state.draft).toEqual({ "home.title": "Tu casa en Guadalajara" }); // eyebrow = valor por defecto
    state = await repo.publishContent();
    expect(state.published["home.title"]).toBe("Tu casa en Guadalajara");
    expect(state.draft).toBeNull();
    const [entry] = await repo.listAudit({ entityId: "site" });
    expect(entry.action).toBe("content_publish");
    expect(entry.changes["home.title"]).toEqual({
      from: "Encuentra tu casa en Guadalajara",
      to: "Tu casa en Guadalajara",
    });
  });

  it("rechaza campos que no existen, textos largos o vacíos", async () => {
    await expect(repo.saveContentDraft({ "home.inventado": "x" })).rejects.toThrow(/no se puede editar/);
    await expect(repo.saveContentDraft({ "home.title": "x".repeat(61) })).rejects.toThrow(/máximo 60/);
    await expect(repo.saveContentDraft({ "home.title": "  " })).rejects.toThrow(/vacío/);
    await expect(repo.saveContentDraft({ "company.social.facebook": "facebook.com/x" })).rejects.toThrow(/https/);
  });

  it("un editor no puede cambiar los datos de la empresa", async () => {
    actor = DEMO_USERS[1];
    await expect(repo.saveContentDraft({ "company.offices.0.phone": "949 000 000" })).rejects.toThrow(/administrador/);
    await expect(repo.saveContentDraft({ "home.title": "Otro título" })).resolves.toBeTruthy();
  });

  it("descartar borrador deja lo publicado", async () => {
    await repo.saveContentDraft({ "contact.title": "Escríbenos" });
    const state = await repo.discardContentDraft();
    expect(state.draft).toBeNull();
    expect(state.published).toEqual({});
  });
});

describe("deshacer desde el histórico", () => {
  const last = async (entityId: string) => (await repo.listAudit({ entityId }))[0];

  it("deshace una edición y lo registra como cambio nuevo", async () => {
    const p = await repo.createProperty(input);
    await repo.updateProperty(p.id, { title: "Piso reformado con dos dormitorios", bedrooms: 3 });
    const edit = await last(p.id);
    await repo.revertAuditEntry(edit.id);
    const back = await repo.getProperty(p.id);
    expect(back).toMatchObject({ title: input.title, bedrooms: 2, slug: p.slug });
    const entries = await repo.listAudit({ entityId: p.id });
    expect(entries[0].action).toBe("revert");
    expect(entries).toHaveLength(3); // crear, editar, deshacer: nada se borra
  });

  it("deshace una rebaja y un cambio de estado", async () => {
    const p = await repo.createProperty(input);
    await repo.applyPriceDrop(p.id, 140000);
    await repo.revertAuditEntry((await last(p.id)).id);
    expect(await repo.getProperty(p.id)).toMatchObject({ price: 150000, previousPrice: null });
    await repo.setStatus(p.id, "vendido");
    await repo.revertAuditEntry((await last(p.id)).id);
    expect(await repo.getProperty(p.id)).toMatchObject({ status: "disponible", closedAt: null });
  });

  it("deshacer un borrado lo restaura", async () => {
    const p = await repo.createProperty(input);
    await repo.deleteProperty(p.id);
    await repo.revertAuditEntry((await last(p.id)).id);
    expect((await repo.getProperty(p.id))?.deletedAt).toBeNull();
  });

  it("deshace una publicación de contenido", async () => {
    await repo.saveContentDraft({ "home.title": "Título nuevo de portada" });
    await repo.publishContent();
    await repo.revertAuditEntry((await last("site")).id);
    expect((await repo.getContentState()).published).toEqual({});
  });
});

describe("histórico", () => {
  it("registra quién cambió qué, con antes y después", async () => {
    const p = await repo.createProperty(input);
    actor = DEMO_USERS[1];
    await repo.updateProperty(p.id, { price: 145000, bedrooms: 3 });
    const [last, first] = await repo.listAudit({ entityId: p.id });
    expect(first).toMatchObject({ action: "create", actor: { id: DEMO_USERS[0].id } });
    expect(last).toMatchObject({ action: "update", actor: { id: DEMO_USERS[1].id } });
    expect(last.changes.price).toEqual({ from: 150000, to: 145000 });
    expect(last.changes.bedrooms).toEqual({ from: 2, to: 3 });
    expect(last.changes.title).toBeUndefined();
  });

  it("avisa a los suscriptores al cambiar datos", async () => {
    let calls = 0;
    const off = repo.subscribe(() => calls++);
    await repo.createProperty(input);
    off();
    await repo.createProperty(input);
    expect(calls).toBe(1);
  });
});

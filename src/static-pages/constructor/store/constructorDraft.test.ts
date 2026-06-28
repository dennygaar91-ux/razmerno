import {
  CONSTRUCTOR_DRAFT_STORAGE_KEY,
  clearConstructorDraft,
  loadConstructorDraft,
  restoreConstructorDraftToStore,
  saveConstructorDraft,
} from "./constructorDraft";
import { useConstructorStore } from "./constructorStore";
import type { ConstructorSnapshot } from "../adapters/constructorPayload";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function test(name: string, run: () => void) {
  try {
    run();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const storage = new MemoryStorage();

const snapshot: ConstructorSnapshot = {
  furniture: "wardrobe",
  width: 1900,
  height: 2450,
  depth: 650,
  fill: "drawers",
  sections: 4,
  compartments: 3,
  handleless: true,
  material: "graphite",
  deliveryEnabled: true,
  assemblyEnabled: true,
  deliveryAddress: "Москва",
  contact: {
    name: "Иван",
    phone: "+7 (999) 111-22-33",
    email: "ivan@example.ru",
    company: "bot",
  },
  consent: true,
};

test("constructor draft: save excludes PII", () => {
  storage.clear();
  const draft = saveConstructorDraft(snapshot, storage);
  const raw = storage.getItem(CONSTRUCTOR_DRAFT_STORAGE_KEY) ?? "";

  assert(draft.dimensions[0] === 1900, "Expected width in draft");
  assert(draft.handleless === true, "Expected handleless style in draft");
  assert(!raw.includes("ivan@example.ru"), "Draft must not include email");
  assert(!raw.includes("+7"), "Draft must not include phone");
  assert(!raw.includes("Москва"), "Draft must not include delivery address");
  assert(!raw.includes("bot"), "Draft must not include honeypot/company");
});

test("constructor draft: load validates stored shape", () => {
  storage.clear();
  storage.setItem(CONSTRUCTOR_DRAFT_STORAGE_KEY, JSON.stringify({ invalid: true }));
  assert(loadConstructorDraft(storage) === null, "Invalid draft should be ignored");

  saveConstructorDraft(snapshot, storage);
  assert(loadConstructorDraft(storage)?.sections === 4, "Valid draft should load");
});

test("constructor draft: restore writes safe fields to store", () => {
  storage.clear();
  useConstructorStore.getState().reset();
  saveConstructorDraft(snapshot, storage);

  const restored = restoreConstructorDraftToStore(storage);
  const state = useConstructorStore.getState();

  assert(restored !== null, "Expected restored draft");
  assert(state.width === 1900, "Expected restored width");
  assert(state.sections === 4, "Expected restored sections");
  assert(state.fill === "drawers", "Expected restored filling");
  assert(state.handleless === true, "Expected restored handleless style");
  assert(state.material === "ldsp-egger-u780-seryy-monumentalnyy-st9", "Expected restored real material id");
  assert(state.contact.email === "", "Contact email must not be restored");
  assert(state.deliveryAddress === "", "Delivery address must not be restored");
});

test("constructor draft: clear removes stored draft", () => {
  saveConstructorDraft(snapshot, storage);
  clearConstructorDraft(storage);
  assert(loadConstructorDraft(storage) === null, "Draft should be cleared");
});

test("constructor draft: restore keeps manual layouts, filling, facades and facade material", () => {
  storage.clear();
  useConstructorStore.getState().reset();
  useConstructorStore.getState().setSections(3);
  useConstructorStore.getState().setSectionWidth("section-1", 800);
  useConstructorStore.getState().setCompartments(2);
  useConstructorStore
    .getState()
    .setCompartmentHeight("section-1", "section-1-compartment-1", 1500);
  useConstructorStore
    .getState()
    .setCompartmentFilling("section-1", "section-1-compartment-1", {
      shelvesCount: 2,
      drawersCount: 1,
    });
  useConstructorStore.getState().setAllSectionFacadeMode("open");
  useConstructorStore.getState().setSectionFacadeMode("section-1", "hinged");
  useConstructorStore
    .getState()
    .setZoneFacadeMode("section-1", "section-1-compartment-1", "open");
  useConstructorStore.getState().setHandleless(true);
  useConstructorStore
    .getState()
    .setFacadeMaterial("mdf-egger-r010-seryy-grafitovyy-ms");

  saveConstructorDraft(useConstructorStore.getState(), storage);
  useConstructorStore.getState().reset();
  const restored = restoreConstructorDraftToStore(storage);
  const state = useConstructorStore.getState();

  assert(restored !== null, "Expected restored draft");
  assert(state.sectionLayout.length === 3, "Expected restored 3 sections");
  assert(state.sectionLayout[0].widthMm === 800, "Expected restored manual section width");
  assert(
    state.compartmentLayout["section-1"]?.[0]?.heightMm === 1500,
    "Expected restored manual compartment height",
  );
  assert(
    state.fillingLayout["section-1"]?.["section-1-compartment-1"]?.shelvesCount === 2,
    "Expected restored shelves in selected compartment",
  );
  assert(
    state.fillingLayout["section-1"]?.["section-1-compartment-1"]?.drawersCount === 1,
    "Expected restored drawers in selected compartment",
  );
  assert(state.facadeLayout["section-1"] === "hinged", "Expected restored hinged facade");
  assert(state.facadeLayout["section-2"] === "open", "Expected restored open facade");
  assert(
    state.zoneFacadeLayout["section-1"]?.["section-1-compartment-1"] === "open",
    "Expected restored zone facade override",
  );
  assert(state.handleless === true, "Expected restored handleless choice");
  assert(
    state.facadeMaterial === "mdf-egger-r010-seryy-grafitovyy-ms",
    "Expected restored facade material id",
  );
});

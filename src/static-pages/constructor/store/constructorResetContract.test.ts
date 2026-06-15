import {
  constructorInitialState,
  useConstructorStore,
} from "./constructorStore";

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

test("constructor reset contract: full project reset clears checkout and transient store state", () => {
  useConstructorStore.getState().setStep("checkout");
  useConstructorStore.getState().setWidth(2100);
  useConstructorStore.getState().setHeight(2450);
  useConstructorStore.getState().setDepth(650);
  useConstructorStore.getState().setSections(4);
  useConstructorStore.getState().setCompartments(3);
  useConstructorStore.getState().setMaterial("ldsp-egger-u961-chernyy-grafit-st7");
  useConstructorStore.getState().setFacadeMaterial("mdf-egger-r010-seryy-grafitovyy-ms");
  useConstructorStore.getState().setHandleless(true);
  useConstructorStore.getState().setDeliveryEnabled(true);
  useConstructorStore.getState().setAssemblyEnabled(true);
  useConstructorStore.getState().setDeliveryAddress("Москва, в пределах МКАД");
  useConstructorStore.getState().setContact({
    name: "Анна",
    phone: "+7 999 000-00-00",
    email: "anna@example.ru",
    company: "",
  });
  useConstructorStore.getState().setConsent(true);
  useConstructorStore.getState().setSceneRenderMode("svg");
  useConstructorStore.getState().setSceneViewMode("front");
  useConstructorStore.getState().setExactModeEnabled(true);
  useConstructorStore.getState().setProductionSnapshotLoading();

  useConstructorStore.getState().reset();
  const state = useConstructorStore.getState();

  assert(state.step === constructorInitialState.step, "step should reset to initial step");
  assert(state.width === constructorInitialState.width, "width should reset");
  assert(state.height === constructorInitialState.height, "height should reset");
  assert(state.depth === constructorInitialState.depth, "depth should reset");
  assert(state.sections === constructorInitialState.sections, "sections should reset");
  assert(state.compartments === constructorInitialState.compartments, "zones should reset");
  assert(state.material === constructorInitialState.material, "material should reset");
  assert(state.facadeMaterial === constructorInitialState.facadeMaterial, "facade material should reset");
  assert(state.handleless === constructorInitialState.handleless, "handleless should reset");
  assert(state.deliveryEnabled === constructorInitialState.deliveryEnabled, "delivery should reset");
  assert(state.assemblyEnabled === constructorInitialState.assemblyEnabled, "assembly should reset");
  assert(state.deliveryAddress === constructorInitialState.deliveryAddress, "address should reset");
  assert(state.contact.email === constructorInitialState.contact.email, "email should reset");
  assert(state.contact.phone === constructorInitialState.contact.phone, "phone should reset");
  assert(state.consent === constructorInitialState.consent, "consent should reset");
  assert(state.sceneRenderMode === constructorInitialState.sceneRenderMode, "render mode should reset");
  assert(state.sceneViewMode === constructorInitialState.sceneViewMode, "view mode should reset");
  assert(state.exactModeEnabled === constructorInitialState.exactModeEnabled, "exact mode should reset");
  assert(state.advancedSizes === constructorInitialState.advancedSizes, "advanced sizes should reset");
  assert(state.advancedFill === constructorInitialState.advancedFill, "advanced fill should reset");
  assert(state.productionSnapshot.status === constructorInitialState.productionSnapshot.status, "production snapshot should reset");
  assert(state.validation.status === constructorInitialState.validation.status, "validation should reset");
});

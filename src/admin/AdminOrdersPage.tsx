import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AdminOrderRow, AdminStatusEventRow, AdminProductionDetail, ProductionReviewStatus } from "./types";
import {
  ADMIN_SESSION_KEY,
  loginAdmin,
  fetchAdminOrders,
  updateOrderStatus,
  loadProductionDetail,
  updateProductionReview,
  ADMIN_STATUS_EVENTS_API_URL,
} from "./adminClient";
import { formatDate, mapApiOrder } from "./format";
import { ProductionReviewPanel } from "./ProductionReviewPanel";
import { AdminOrderDetailPage } from "./AdminOrderDetailPage";
import { summarizeOrderForAdmin } from "./orderSummary";
import type { AdminOrderDetailSummary } from "./orderSummary";

const DEMO_ORDERS: AdminOrderRow[] = [
  {
    id: "RZ-20260526-1042",
    status: "new",
    customer: "Клиент из заявки",
    phone: "+7 *** ***-**-**",
    email: "e***@mail.ru",
    product: "Шкаф 1800×2400×600",
    productType: "Шкаф",
    dimensions: { widthMm: 1800, heightMm: 2400, depthMm: 600 },
    materialsSummary: "not available in current admin payload",
    pricingLabel: "demo / not verified",
    pricingSource: "pricing source not verified",
    total: "86 400 ₽",
    createdAt: "demo",
    delivery: "МКАД",
    assembly: "да",
    managerEmail: "demo",
    customerEmail: "demo",
    production: "requires-review · W0/R0/A0 · rev.1",
    productionStatus: "requires-review",
  },
];

export function AdminOrdersPage({ routePath = "/admin" }: { routePath?: string }) {
  const [input, setInput] = useState("");
  const routeOrderId = routePath.match(/^\/admin\/orders\/(RZ-\d{8}-\d{4})$/)?.[1] ?? null;
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) ?? "");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const unlocked = token.trim().length > 0;

  if (unlocked) {
    return (
      <AdminOrdersDashboard
        adminKey={token}
        routeOrderId={routeOrderId}
        onLogout={() => {
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
          setToken("");
        }}
      />
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--rzm-surface-canvas)] px-4 text-[var(--rzm-text-main)]">
      <section className="rzm-card w-full max-w-[480px] p-5 md:p-6">
        <div className="eyebrow mb-4">Admin access</div>
        <h1 className="font-display text-[30px] font-bold leading-[1] tracking-[-0.04em] md:text-[38px]">Доступ к заявкам</h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-[var(--rzm-text-muted)]">
          Введите admin-пароль. Проверка выполняется на сервере, после входа создаётся временная сессия.
        </p>

        {loginError && (
          <div className="mt-4 rzm-status" data-status="error">
            <span>{loginError}</span>
          </div>
        )}

        <form
          className="mt-5 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoginError(null);
            setIsLoggingIn(true);
            try {
              const nextToken = await loginAdmin(input);
              sessionStorage.setItem(ADMIN_SESSION_KEY, nextToken);
              setToken(nextToken);
            } catch (error) {
              setLoginError(error instanceof Error ? error.message : "Не удалось войти");
            } finally {
              setIsLoggingIn(false);
            }
          }}
        >
          <label className="block">
            <span className="rzm-field-label mb-2">Admin password</span>
            <input
              type="password"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="control-field w-full px-4 outline-none"
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
          </label>
          <button type="submit" disabled={isLoggingIn || input.trim().length < 1} className="btn btn-primary w-full focus-ring">
            {isLoggingIn ? "Проверяю..." : "Открыть админку"}
          </button>
        </form>
      </section>
    </main>
  );
}

function AdminOrdersDashboard({
  adminKey,
  routeOrderId,
  onLogout,
}: {
  adminKey: string;
  routeOrderId: string | null;
  onLogout: () => void;
}) {
  const [orders, setOrders] = useState<AdminOrderRow[]>(DEMO_ORDERS);
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusEvents, setStatusEvents] = useState<AdminStatusEventRow[]>([]);
  const [selectedProductionOrderId, setSelectedProductionOrderId] = useState<string | null>(null);
  const [productionDetail, setProductionDetail] = useState<AdminProductionDetail | null>(null);
  const [productionNote, setProductionNote] = useState("Проверено вручную");
  const [productionStatus, setProductionStatus] = useState<ProductionReviewStatus>("requires-review");
  const [productionLoading, setProductionLoading] = useState(false);
  const [detailSummary, setDetailSummary] = useState<AdminOrderDetailSummary | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadStatusEvents() {
    try {
      const response = await fetch(`${ADMIN_STATUS_EVENTS_API_URL}?limit=20`, {
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });
      const data = (await response.json()) as { ok?: boolean; events?: AdminStatusEventRow[]; message?: string };
      if (!response.ok || data.ok !== true) throw new Error(data.message || `HTTP ${response.status}`);
      setStatusEvents(data.events ?? []);
    } catch {
      setStatusEvents([]);
    }
  }

  async function loadOrders() {
    setIsLoading(true);
    setError(null);

    try {
      const apiOrders = await fetchAdminOrders(adminKey);
      const mapped = apiOrders.map(mapApiOrder);
      setOrders(mapped.length > 0 ? mapped : DEMO_ORDERS);
      setSource(mapped.length > 0 ? "api" : "demo");
      if (mapped.length > 0) await loadStatusEvents();
    } catch (err) {
      setOrders(DEMO_ORDERS);
      setSource("demo");
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  useEffect(() => {
    if (!routeOrderId) {
      setDetailSummary(null);
      return;
    }

    const activeOrderId = routeOrderId;
    const order = orders.find((item) => item.id === activeOrderId) ?? null;
    if (!order) {
      setDetailSummary(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      const activeOrder = order!;
      setDetailLoading(true);
      try {
        let nextProductionDetail: AdminProductionDetail | null = null;
        if (source === "api") {
          nextProductionDetail = await loadProductionDetail(adminKey, activeOrderId);
        }
        if (!cancelled) {
          setDetailSummary(summarizeOrderForAdmin(activeOrder, nextProductionDetail));
        }
      } catch {
        if (!cancelled) {
          setDetailSummary(summarizeOrderForAdmin(activeOrder));
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [adminKey, orders, routeOrderId, source]);

  const totalOrders = orders.length;
  const inProgress = orders.filter((item) => item.status === "in_progress").length;
  const assemblyCount = orders.filter((item) => item.assembly !== "нет").length;
  const productionQueue = orders.filter((item) => item.productionStatus !== "auto-generated").length;

  async function handleStatusChange(orderId: string, status: "new" | "in_progress" | "done") {
    setStatusUpdatingId(orderId);
    setError(null);

    try {
      await updateOrderStatus(adminKey, orderId, status);
      setOrders((current) => current.map((item) => (item.id === orderId ? { ...item, status } : item)));
      await loadStatusEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить статус");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleOpenProductionReview(orderId: string) {
    setSelectedProductionOrderId(orderId);
    setProductionLoading(true);
    setError(null);
    try {
      const detail = await loadProductionDetail(adminKey, orderId);
      setProductionDetail(detail);
      const status = detail.productionExport?.review?.status;
      if (status === "approved-for-basis" || status === "blocked" || status === "manually-adjusted" || status === "requires-review") {
        setProductionStatus(status);
      } else {
        setProductionStatus("requires-review");
      }
    } catch (err) {
      setProductionDetail(null);
      setError(err instanceof Error ? err.message : "Не удалось загрузить production JSON");
    } finally {
      setProductionLoading(false);
    }
  }

  async function handleSaveProductionReview() {
    if (!selectedProductionOrderId) return;
    setProductionLoading(true);
    setError(null);
    try {
      await updateProductionReview(adminKey, selectedProductionOrderId, productionStatus, productionNote);
      await handleOpenProductionReview(selectedProductionOrderId);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить production review");
    } finally {
      setProductionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--rzm-surface-canvas)] text-[var(--rzm-text-main)]">
      <section className="section-pad pb-16 pt-24 md:pt-28">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow mb-4">Admin MVP</div>
            <h1 className="h-section">{routeOrderId ? "Детальная заявка" : "Мониторинг заявок"}</h1>
            {routeOrderId && (
              <p className="mt-2 text-[13px] text-[var(--rzm-text-muted)]">Read-only detail для заявки {routeOrderId}.</p>
            )}
            <p className="mt-4 max-w-[680px] text-[15px] leading-[1.6] text-[var(--rzm-text-muted)]">
              Админка читает masked summary через server API. Финальная цена может считаться authoritative только для строк с
              пометкой final server snapshot; demo и fallback остаются not verified.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void loadOrders()} className="btn btn-outline focus-ring w-fit">
              Обновить
            </button>
            <button type="button" onClick={onLogout} className="btn btn-outline focus-ring w-fit">
              Выйти
            </button>
            <a href="/" className="btn btn-outline focus-ring w-fit">
              На лендинг
            </a>
          </div>
        </div>

        {error && (
          <div className="mt-5 rzm-status" data-status="warning">
            <span>API недоступен: {error}. Показаны demo-данные.</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Metric label="Источник" value={source === "api" ? "Server API" : "Demo"} />
          <Metric label="Заявки" value={String(totalOrders)} />
          <Metric label="В работе" value={String(inProgress)} />
          <Metric label="Сборка" value={`${assemblyCount}`} />
          <Metric label="Проверка" value={`${productionQueue}`} />
        </div>

        <div className="mt-6 rzm-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--rzm-line-soft)] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <div className="font-semibold">Последние заявки</div>
              <div className="mt-1 text-[13px] text-[var(--rzm-text-muted)]">
                PII в списке маскируется по умолчанию. {isLoading ? "Загрузка..." : "Данные обновлены."}
              </div>
            </div>
            <div className="rzm-chip">{source === "api" ? "Server API connected" : "Demo fallback"}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[13px]">
              <thead className="bg-[var(--rzm-surface-soft)] text-[var(--rzm-text-muted)]">
                <tr>
                  <Th>№ заявки</Th>
                  <Th>Статус</Th>
                  <Th>Клиент</Th>
                  <Th>Изделие</Th>
                  <Th>Доставка</Th>
                  <Th>Сборка</Th>
                  <Th>Email</Th>
                  <Th>Production</Th>
                  <Th>Сумма</Th>
                  <Th>Дата</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-[var(--rzm-line-soft)]">
                    <Td mono>{order.id}</Td>
                    <Td>
                      <select
                        value={order.status}
                        disabled={statusUpdatingId === order.id || source !== "api"}
                        onChange={(event) => void handleStatusChange(order.id, event.target.value as "new" | "in_progress" | "done")}
                        className="control-field h-9 px-2 text-[12px] outline-none"
                        aria-label={`Статус заявки ${order.id}`}
                      >
                        <option value="new">Новая</option>
                        <option value="in_progress">В работе</option>
                        <option value="done">Закрыта</option>
                      </select>
                      {statusUpdatingId === order.id && (
                        <div className="mt-1 text-[11px] text-[var(--rzm-text-muted)]">Сохраняю...</div>
                      )}
                      {source !== "api" && <div className="mt-1 text-[11px] text-[var(--rzm-text-muted)]">demo readonly</div>}
                    </Td>
                    <Td>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-[12px] text-[var(--rzm-text-muted)]">{order.phone}</div>
                      <div className="text-[12px] text-[var(--rzm-text-muted)]">{order.email}</div>
                    </Td>
                    <Td>{order.product}</Td>
                    <Td>{order.delivery}</Td>
                    <Td>{order.assembly}</Td>
                    <Td>
                      <div className="text-[12px]">Менеджер: {order.managerEmail}</div>
                      <div className="text-[12px] text-[var(--rzm-text-muted)]">Клиент: {order.customerEmail}</div>
                    </Td>
                    <Td>
                      <div className="rzm-status" data-status={order.productionStatus === "blocked" ? "error" : "warning"}>
                        <span>{order.production}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--rzm-text-muted)]">Проф. проверка / ручные правки</div>
                      <button
                        type="button"
                        disabled={source !== "api"}
                        onClick={() => void handleOpenProductionReview(order.id)}
                        className="mt-2 btn btn-outline btn-sm focus-ring"
                      >
                        Проверить
                      </button>
                      <a href={`/admin/orders/${order.id}`} className="ml-2 mt-2 inline-flex btn btn-outline btn-sm focus-ring">
                        Открыть detail
                      </a>
                    </Td>
                    <Td mono>
                      <div>{order.total}</div>
                      <div className="mt-1 text-[11px] text-[var(--rzm-text-muted)]">{order.pricingLabel ?? "demo / not verified"}</div>
                      <div className="text-[11px] text-[var(--rzm-text-muted)]">{order.pricingSource ?? "pricing source not verified"}</div>
                    </Td>
                    <Td>{order.createdAt}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {routeOrderId ? (
          <AdminOrderDetailPage
            summary={detailSummary}
            loading={detailLoading || isLoading}
            onBack={() => {
              window.history.pushState({}, "", "/admin");
              setDetailSummary(null);
            }}
          />
        ) : (
          <ProductionReviewPanel
            orderId={selectedProductionOrderId}
            detail={productionDetail}
            status={productionStatus}
            note={productionNote}
            loading={productionLoading}
            onStatusChange={setProductionStatus}
            onNoteChange={setProductionNote}
            onSave={() => void handleSaveProductionReview()}
            onClose={() => {
              setSelectedProductionOrderId(null);
              setProductionDetail(null);
            }}
          />
        )}

        <div className="mt-6 rzm-card p-4 md:p-5">
          <div className="font-semibold">Последние изменения статусов</div>
          <div className="mt-3 grid gap-2">
            {statusEvents.length === 0 ? (
              <div className="text-[13px] text-[var(--rzm-text-muted)]">История пока пустая или API недоступен.</div>
            ) : (
              statusEvents.map((event) => (
                <div key={event.id} className="status-row">
                  <div className="font-mono text-[12px]">{event.orderId}</div>
                  <div className="mt-1 text-[13px] text-[var(--rzm-text-muted)]">
                    {event.fromStatus ?? "—"} → {event.toStatus} · {event.changedBy} · {formatDate(event.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 rzm-status" data-status="warning">
          <span>Текущий доступ всё ещё MVP-gate. Для production нужен server-side auth и role-based access.</span>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rzm-card-soft p-4">
      <div className="control-meta">{label}</div>
      <div className="mt-2 font-display text-[28px] font-bold tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 font-semibold md:px-5">{children}</th>;
}

function Td({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return <td className={["px-4 py-3 align-top md:px-5", mono ? "font-mono tabular-nums" : ""].join(" ")}>{children}</td>;
}

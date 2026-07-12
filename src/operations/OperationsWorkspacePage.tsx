import { useState } from "react";
import type { ReactNode } from "react";
import { OperationsManualReviewView } from "./OperationsManualReviewView";
import { OperationsDomainStatusBadge } from "./OperationsDomainStatusBadge";
import { ADMIN_SESSION_KEY, loginAdmin } from "../admin/adminClient";
import { formatOperationsDate, formatOperationsPrice } from "../shared/operations/formatOperations";
import { buildOperationsOrderDetailPath, parseOperationsRouteOrderId } from "../shared/operations/orderDetailRoutes";
import { getOperationsManualReviewTitle } from "../shared/operations/reviewTypes";
import { useOperationsOrderReview } from "../shared/operations/useOperationsOrderReview";
import { useOperationsWorkspace } from "../shared/operations/useOperationsWorkspace";
import {
  getOperationsOrderStatusLabel,
  getOperationsWorkspaceEmptyMessage,
  getOperationsWorkspaceErrorMessage,
} from "../shared/operations/types";
import {
  OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS,
  countOperationsWorkspaceByDomainStatus,
  filterOperationsWorkspaceByDomainStatus,
  formatOperationsDomainStatusFilterLabel,
  getOperationsWorkspaceFilteredEmptyMessage,
  type OperationsDomainStatusFilter,
} from "../shared/operations/workspaceFilters";

export function OperationsWorkspacePage({ routePath = "/operations" }: { routePath?: string }) {
  const [input, setInput] = useState("");
  const routeOrderId = parseOperationsRouteOrderId(routePath);
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) ?? "");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const unlocked = token.trim().length > 0;

  if (unlocked) {
    return (
      <OperationsWorkspaceDashboard
        accessToken={token}
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
        <div className="eyebrow mb-4">Operations Workspace</div>
        <h1 className="font-display text-[30px] font-bold leading-[1] tracking-[-0.04em] md:text-[38px]">Очередь заявок</h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-[var(--rzm-text-muted)]">
          Введите operations-пароль. Проверка выполняется на сервере, после входа создаётся временная сессия.
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
            <span className="rzm-field-label mb-2">Operations password</span>
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
            {isLoggingIn ? "Проверяю..." : "Открыть workspace"}
          </button>
        </form>
      </section>
    </main>
  );
}

function OperationsWorkspaceDashboard({
  accessToken,
  routeOrderId,
  onLogout,
}: {
  accessToken: string;
  routeOrderId: string | null;
  onLogout: () => void;
}) {
  const { state, workspace, errorMessage, reload } = useOperationsWorkspace(accessToken, true);
  const [domainStatusFilter, setDomainStatusFilter] = useState<OperationsDomainStatusFilter>("all");
  const {
    state: reviewState,
    review,
    errorMessage: reviewErrorMessage,
    reload: reloadReview,
  } = useOperationsOrderReview(accessToken, routeOrderId);

  const isLoading = state === "loading" || state === "idle";
  const orders = workspace?.orders ?? [];
  const filteredOrders = filterOperationsWorkspaceByDomainStatus(orders, domainStatusFilter);
  const domainStatusCounts = countOperationsWorkspaceByDomainStatus(orders);
  const queueEmptyMessage =
    orders.length === 0
      ? getOperationsWorkspaceEmptyMessage()
      : getOperationsWorkspaceFilteredEmptyMessage(domainStatusFilter);

  function handleBackToQueue() {
    window.history.pushState({}, "", "/operations");
  }

  return (
    <main className="min-h-screen bg-[var(--rzm-surface-canvas)] text-[var(--rzm-text-main)]">
      <section className="section-pad pb-16 pt-24 md:pt-28">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow mb-4">Operations Workspace</div>
            <h1 className="h-section">{routeOrderId ? getOperationsManualReviewTitle() : "Очередь заявок"}</h1>
            <p className="mt-4 max-w-[680px] text-[15px] leading-[1.6] text-[var(--rzm-text-muted)]">
              API-backed очередь заявок для операционной обработки. Клиентские данные показываются только в masked safe read model.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void reload()} className="btn btn-outline focus-ring w-fit">
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

        {state === "error" && (
          <div className="mt-5 rzm-status" data-status="error">
            <span>{errorMessage ?? getOperationsWorkspaceErrorMessage()}</span>
          </div>
        )}

        {state === "unauthorized" && (
          <div className="mt-5 rzm-status" data-status="warning">
            <span>Сессия истекла. Выйдите и войдите снова.</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Metric label="Заявок в очереди" value={String(workspace?.stats.total ?? 0)} />
          <Metric label="Источник" value={state === "success" ? "Server API" : isLoading ? "Загрузка..." : "—"} />
        </div>

        {!routeOrderId && (
          <div className="mt-6 rzm-card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[var(--rzm-line-soft)] px-4 py-4 md:px-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">Очередь заявок</div>
                  <div className="mt-1 text-[13px] text-[var(--rzm-text-muted)]">
                    {isLoading ? "Загрузка..." : state === "success" ? "Данные получены через API." : "Ожидание данных."}
                  </div>
                </div>
                <div className="rzm-chip">{state === "success" ? "Operations API connected" : "Pending"}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {OPERATIONS_DOMAIN_STATUS_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDomainStatusFilter(option.id)}
                    className={[
                      "btn btn-sm focus-ring",
                      domainStatusFilter === option.id ? "btn-primary" : "btn-outline",
                    ].join(" ")}
                    aria-pressed={domainStatusFilter === option.id}
                  >
                    {formatOperationsDomainStatusFilterLabel(option.label, domainStatusCounts[option.id])}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-[13px]">
                <thead className="bg-[var(--rzm-surface-soft)] text-[var(--rzm-text-muted)]">
                  <tr>
                    <Th>№ заявки</Th>
                    <Th>Domain status</Th>
                    <Th>Статус</Th>
                    <Th>Клиент</Th>
                    <Th>Изделие</Th>
                    <Th>Production</Th>
                    <Th>Сумма</Th>
                    <Th>Создана</Th>
                    <Th>Обновлена</Th>
                    <Th>Действие</Th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-[13px] text-[var(--rzm-text-muted)] md:px-5">
                        {queueEmptyMessage}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.orderId} className="border-t border-[var(--rzm-line-soft)]">
                        <Td mono>{order.orderId}</Td>
                        <Td>
                          <OperationsDomainStatusBadge domainStatus={order.domainStatus} />
                        </Td>
                        <Td>{getOperationsOrderStatusLabel(order.status)}</Td>
                        <Td>{order.customerNameMasked}</Td>
                        <Td>{order.productSummary}</Td>
                        <Td>{order.productionStatus}</Td>
                        <Td mono>{formatOperationsPrice(order.totalPrice)}</Td>
                        <Td>{formatOperationsDate(order.createdAt)}</Td>
                        <Td>{formatOperationsDate(order.updatedAt)}</Td>
                        <Td>
                          <a href={buildOperationsOrderDetailPath(order.orderId)} className="btn btn-outline btn-sm focus-ring">
                            Review
                          </a>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {routeOrderId && (
          <OperationsManualReviewView
            review={review}
            state={reviewState}
            errorMessage={reviewErrorMessage}
            loading={reviewState === "loading" || reviewState === "idle"}
            accessToken={accessToken}
            onBack={handleBackToQueue}
            onDraftSaved={reloadReview}
            onDecisionApplied={reloadReview}
          />
        )}
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

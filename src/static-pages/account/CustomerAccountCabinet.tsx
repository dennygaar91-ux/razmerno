import {
  formatFurnitureTypeLabel,
  formatWorkspaceDate,
  formatWorkspacePrice,
  getAccountDashboardTitle,
  getAccountOrdersEmptyMessage,
  getAccountProjectsEmptyMessage,
  isWorkspaceFullyEmpty,
} from "../../shared/workspace/formatWorkspace";
import { buildConfiguratorResumeUrl } from "../../shared/projects/projectResume";
import { buildAccountOrderUrl } from "../../shared/workspace/orderDetailRoutes";
import { useCustomerWorkspace } from "../../shared/workspace/useCustomerWorkspace";
import type { CustomerWorkspace } from "../../shared/workspace/types";
import { CustomerProfileSection } from "./CustomerProfileSection";
import { CustomerNotificationsSection } from "./CustomerNotificationsSection";

function AccountSummaryCards({ workspace }: { workspace: CustomerWorkspace }) {
  return (
    <div className="rzm-account-summary" aria-label="Сводка кабинета">
      <article className="rzm-account-summary-card">
        <p className="rzm-account-summary-label">Активные проекты</p>
        <p className="rzm-account-summary-value">{workspace.stats.activeProjects}</p>
      </article>
      <article className="rzm-account-summary-card">
        <p className="rzm-account-summary-label">Заказы</p>
        <p className="rzm-account-summary-value">{workspace.stats.orders}</p>
      </article>
      <article className="rzm-account-summary-card">
        <p className="rzm-account-summary-label">Email</p>
        <p className="rzm-account-summary-value rzm-account-summary-value--text">{workspace.profile.email}</p>
      </article>
    </div>
  );
}

function AccountProjectsSection({ workspace }: { workspace: CustomerWorkspace }) {
  return (
    <section className="rzm-account-section" aria-labelledby="account-projects-title">
      <div className="rzm-account-section-head">
        <h2 id="account-projects-title">Проекты</h2>
        <p className="rzm-step-text">Сохранённые конфигурации на сервере.</p>
      </div>
      {workspace.projects.length === 0 ? (
        <p className="rzm-account-empty">{getAccountProjectsEmptyMessage()}</p>
      ) : (
        <ul className="rzm-account-list">
          {workspace.projects.map((project) => (
            <li key={project.id} className="rzm-account-list-item">
              <div className="rzm-account-list-main">
                <p className="rzm-account-list-title">{project.title}</p>
                <p className="rzm-account-list-meta">
                  {formatFurnitureTypeLabel(project.furnitureType)} · обновлён {formatWorkspaceDate(project.updatedAt)}
                </p>
              </div>
              <div className="rzm-account-list-actions">
                <a
                  className="rzm-ui-btn rzm-ui-btn--secondary rzm-account-project-open"
                  href={buildConfiguratorResumeUrl(project.id)}
                >
                  Открыть в конструкторе
                </a>
                {project.previewPath ? (
                  <div className="rzm-account-preview" aria-hidden="true">
                    <img src={project.previewPath} alt="" />
                  </div>
                ) : (
                  <div className="rzm-account-preview rzm-account-preview--placeholder" aria-hidden="true" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AccountOrdersSection({ workspace }: { workspace: CustomerWorkspace }) {
  return (
    <section className="rzm-account-section" aria-labelledby="account-orders-title">
      <div className="rzm-account-section-head">
        <h2 id="account-orders-title">Заказы</h2>
        <p className="rzm-step-text">Отправленные заявки и их статус проверки.</p>
      </div>
      {workspace.orders.length === 0 ? (
        <p className="rzm-account-empty">{getAccountOrdersEmptyMessage()}</p>
      ) : (
        <ul className="rzm-account-list">
          {workspace.orders.map((order) => (
            <li key={order.id} className="rzm-account-list-item">
              <div className="rzm-account-list-main">
                <a className="rzm-account-list-title rzm-account-order-link" href={buildAccountOrderUrl(order.id)}>
                  {order.publicOrderNumber ?? "Заявка без номера"}
                </a>
                <p className="rzm-account-list-meta">
                  {order.status?.label || "Статус уточняется"} · {formatWorkspaceDate(order.createdAt)}
                </p>
                {order.deliveryAddress ? (
                  <p className="rzm-account-list-sub">{order.deliveryAddress}</p>
                ) : null}
              </div>
              <div className="rzm-account-list-actions">
                <p className="rzm-account-order-price">{formatWorkspacePrice(order.totalPrice)}</p>
                <a className="rzm-ui-btn rzm-ui-btn--secondary rzm-account-project-open" href={buildAccountOrderUrl(order.id)}>
                  Открыть заказ
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CustomerAccountCabinet() {
  const { state, workspace, errorMessage, reload, updateProfile } = useCustomerWorkspace(true);

  if (state === "loading" || state === "idle") {
    return (
      <section className="rzm-account-panel" aria-live="polite">
        <p className="rzm-account-panel-text">Загружаем личный кабинет…</p>
      </section>
    );
  }

  if (state === "unauthorized") {
    return (
      <section className="rzm-account-panel rzm-account-panel--blocked" aria-live="polite">
        <h1 className="rzm-account-panel-title">Сессия завершена</h1>
        <p className="rzm-account-panel-text">
          {errorMessage ?? "Войдите снова, чтобы открыть личный кабинет."}
        </p>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="rzm-account-panel rzm-account-panel--blocked" aria-live="polite">
        <h1 className="rzm-account-panel-title">Не удалось загрузить кабинет</h1>
        <p className="rzm-account-panel-text">{errorMessage ?? "Попробуйте обновить страницу."}</p>
        <div className="rzm-account-panel-actions">
          <button type="button" className="rzm-ui-btn rzm-ui-btn--secondary" onClick={() => void reload()}>
            Повторить
          </button>
        </div>
      </section>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <div className="rzm-account-cabinet">
      <header className="rzm-account-hero">
        <p className="rzm-kicker">Личный кабинет</p>
        <h1 className="rzm-account-title">{getAccountDashboardTitle(workspace.profile.fullName)}</h1>
        <p className="rzm-step-text">
          Здесь собраны ваши проекты, заказы и контактные данные после отправки заявки.
        </p>
        {isWorkspaceFullyEmpty(workspace) ? (
          <p className="rzm-account-empty rzm-account-empty--inline">
            Кабинет пока пустой — сохраните проект или отправьте первую заявку из конструктора.
          </p>
        ) : null}
      </header>

      <AccountSummaryCards workspace={workspace} />
      <CustomerNotificationsSection />
      <AccountProjectsSection workspace={workspace} />
      <AccountOrdersSection workspace={workspace} />
      <CustomerProfileSection profile={workspace.profile} onProfileUpdated={updateProfile} />
    </div>
  );
}

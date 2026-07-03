import {
  formatWorkspaceDate,
  formatWorkspacePrice,
} from "../../shared/workspace/formatWorkspace";
import { useCustomerOrderDetail } from "../../shared/workspace/useCustomerOrderDetail";
import type { CustomerOrderDetail } from "../../shared/workspace/orderDetailTypes";

function CustomerOrderPricingSection({ order }: { order: CustomerOrderDetail }) {
  const { pricingSummary } = order;

  return (
    <section className="rzm-account-section" aria-labelledby="order-pricing-title">
      <div className="rzm-account-section-head">
        <h2 id="order-pricing-title">Стоимость</h2>
        <p className="rzm-step-text">Итоговая смета по заявке.</p>
      </div>
      <dl className="rzm-account-order-pricing">
        <div>
          <dt>Шкаф</dt>
          <dd>{formatWorkspacePrice(pricingSummary.furnitureTotal)}</dd>
        </div>
        {order.deliveryEnabled && pricingSummary.deliveryTotal !== null ? (
          <div>
            <dt>Доставка</dt>
            <dd>{formatWorkspacePrice(pricingSummary.deliveryTotal)}</dd>
          </div>
        ) : null}
        {order.assemblyEnabled && pricingSummary.assemblyTotal !== null ? (
          <div>
            <dt>Сборка</dt>
            <dd>{formatWorkspacePrice(pricingSummary.assemblyTotal)}</dd>
          </div>
        ) : null}
        <div className="rzm-account-order-pricing-total">
          <dt>Итого</dt>
          <dd>{formatWorkspacePrice(order.totalPrice)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function CustomerOrderDetailCard({ orderId }: { orderId: string }) {
  const { state, order, errorMessage, reload } = useCustomerOrderDetail(orderId, true);

  if (state === "loading" || state === "idle") {
    return (
      <section className="rzm-account-panel" aria-live="polite">
        <p className="rzm-account-panel-text">Загружаем карточку заказа…</p>
      </section>
    );
  }

  if (state === "unauthorized") {
    return (
      <section className="rzm-account-panel rzm-account-panel--blocked" aria-live="polite">
        <h1 className="rzm-account-panel-title">Требуется авторизация</h1>
        <p className="rzm-account-panel-text">{errorMessage ?? "Войдите снова, чтобы открыть заказ."}</p>
      </section>
    );
  }

  if (state === "not_found") {
    return (
      <section className="rzm-account-panel rzm-account-panel--blocked" aria-live="polite">
        <h1 className="rzm-account-panel-title">Заказ не найден</h1>
        <p className="rzm-account-panel-text">{errorMessage ?? "Проверьте ссылку или вернитесь в кабинет."}</p>
        <div className="rzm-account-panel-actions">
          <a className="rzm-secondary-cta" href="/account">Вернуться в кабинет</a>
        </div>
      </section>
    );
  }

  if (state === "error" || !order) {
    return (
      <section className="rzm-account-panel rzm-account-panel--blocked" aria-live="polite">
        <h1 className="rzm-account-panel-title">Не удалось загрузить заказ</h1>
        <p className="rzm-account-panel-text">{errorMessage ?? "Попробуйте обновить страницу."}</p>
        <div className="rzm-account-panel-actions">
          <button type="button" className="rzm-ui-btn rzm-ui-btn--secondary" onClick={() => void reload()}>
            Повторить
          </button>
          <a className="rzm-secondary-cta" href="/account">Вернуться в кабинет</a>
        </div>
      </section>
    );
  }

  return (
    <div className="rzm-account-cabinet">
      <header className="rzm-account-hero">
        <p className="rzm-kicker">Карточка заказа</p>
        <h1 className="rzm-account-title">{order.publicOrderNumber ?? "Заявка без номера"}</h1>
        <p className="rzm-step-text">
          {order.domainStatus || "Статус уточняется"} · {formatWorkspaceDate(order.createdAt)}
        </p>
      </header>

      <section className="rzm-account-section" aria-labelledby="order-contacts-title">
        <div className="rzm-account-section-head">
          <h2 id="order-contacts-title">Контакты и доставка</h2>
        </div>
        <dl className="rzm-account-profile">
          <div>
            <dt>Имя</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>{order.customerPhone || "Не указан"}</dd>
          </div>
          <div>
            <dt>Доставка</dt>
            <dd>{order.deliveryEnabled ? "Да" : "Нет"}</dd>
          </div>
          {order.deliveryAddress ? (
            <div>
              <dt>Адрес</dt>
              <dd>{order.deliveryAddress}</dd>
            </div>
          ) : null}
          <div>
            <dt>Сборка</dt>
            <dd>{order.assemblyEnabled ? "Да" : "Нет"}</dd>
          </div>
        </dl>
      </section>

      {order.dimensionsSummary || order.materialsDecorSummary ? (
        <section className="rzm-account-section" aria-labelledby="order-config-title">
          <div className="rzm-account-section-head">
            <h2 id="order-config-title">Конфигурация</h2>
          </div>
          <dl className="rzm-account-profile">
            {order.dimensionsSummary ? (
              <div>
                <dt>Размеры</dt>
                <dd>{order.dimensionsSummary}</dd>
              </div>
            ) : null}
            {order.materialsDecorSummary ? (
              <div>
                <dt>Материалы и декор</dt>
                <dd>{order.materialsDecorSummary}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <CustomerOrderPricingSection order={order} />

      <div className="rzm-account-panel-actions">
        <a className="rzm-secondary-cta" href="/account">Вернуться в кабинет</a>
      </div>
    </div>
  );
}

import { SiteHeader } from "./shared/SiteHeader";
import { InfoFooter } from "./shared/InfoFooter";
import { AccountPageGate } from "./account/AccountPageGate";
import { CustomerOrderDetailCard } from "./account/CustomerOrderDetailCard";
import { parseAccountOrderIdFromPathname } from "../shared/workspace/orderDetailRoutes";

type AccountOrderPageProps = {
  pathname?: string;
};

export default function AccountOrderPage({ pathname }: AccountOrderPageProps) {
  const orderId = parseAccountOrderIdFromPathname(pathname ?? window.location.pathname);

  return (
    <>
      <SiteHeader activePage="home" />
      <main className="rzm-account-main">
        <AccountPageGate>
          {orderId ? (
            <CustomerOrderDetailCard orderId={orderId} />
          ) : (
            <section className="rzm-account-panel rzm-account-panel--blocked" aria-live="polite">
              <h1 className="rzm-account-panel-title">Заказ не найден</h1>
              <p className="rzm-account-panel-text">Некорректная ссылка на карточку заказа.</p>
              <div className="rzm-account-panel-actions">
                <a className="rzm-secondary-cta" href="/account">Вернуться в кабинет</a>
              </div>
            </section>
          )}
        </AccountPageGate>
      </main>
      <InfoFooter />
    </>
  );
}

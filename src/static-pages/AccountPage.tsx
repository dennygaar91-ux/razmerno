import { SiteHeader } from "./shared/SiteHeader";
import { InfoFooter } from "./shared/InfoFooter";
import { AccountPageGate } from "./account/AccountPageGate";
import { CustomerAccountCabinet } from "./account/CustomerAccountCabinet";

export default function AccountPage() {
  return (
    <>
      <SiteHeader activePage="home" />
      <main className="rzm-account-main">
        <AccountPageGate>
          <CustomerAccountCabinet />
        </AccountPageGate>
      </main>
      <InfoFooter />
    </>
  );
}

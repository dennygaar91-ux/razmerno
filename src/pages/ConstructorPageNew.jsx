import Header from "../components/Header/Header";
import ConstructorLayout from "../constructor-v2/layout/ConstructorLayout";
import "../styles/constructor-rebuild-start.css";

export default function ConstructorPageNew() {
  return (
    <>
      <Header />

      <main className="constructor-rebuild-page">
        <ConstructorLayout />
      </main>
    </>
  );
}

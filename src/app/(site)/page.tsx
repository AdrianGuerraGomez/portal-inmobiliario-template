import { HomeView } from "@/components/site/home-view";
import { JsonLd, organizationJsonLd } from "@/components/site/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <HomeView />
    </>
  );
}

import dynamic from "next/dynamic";

const Marketplace = dynamic(() => import("./Marketplace"), { ssr: false });

export default function MarketplacePage() {
  return <Marketplace />;
}

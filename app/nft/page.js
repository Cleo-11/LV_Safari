import dynamic from "next/dynamic";

const TrunkCustomizer = dynamic(() => import("./TrunkCustomizer"), { ssr: false });

export default function NFTPage() {
  return <TrunkCustomizer />;
}

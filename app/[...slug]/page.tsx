import { TruckSalesSite } from "../site";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <TruckSalesSite page={slug.join("/")} />;
}

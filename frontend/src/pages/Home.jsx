import Hero from "../components/Hero";
import Features from "../components/Features";
import CategoryTiles from "../components/CategoryTiles";
import Popular_products from "../components/Product_list";
import Offer from "../components/Offer";
import NewCollections from "../components/NewCollections";
import NewsLetter from "../components/NewsLetter";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <CategoryTiles />
      <Popular_products />
      <Offer />
      <NewCollections />
      <NewsLetter />
    </>
  );
}

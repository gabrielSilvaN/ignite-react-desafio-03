import { useState, useEffect } from "react";

import { ProductList } from "./styles";
import { api } from "../../services/api";
import { formatPrice } from "../../util/format";
import { ProductItem } from "../../components/ProductItem";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);

  useEffect(() => {
    async function loadProducts() {
      api.get("products").then((response) =>
        setProducts(
          response.data.map((product: Product) => ({
            ...product,
            priceFormatted: formatPrice(product.price),
          }))
        )
      );
    }

    loadProducts();
  }, []);

  return (
    <ProductList>
      {products.map((product) => (
        <ProductItem product={product} key={product.id} />
      ))}
    </ProductList>
  );
};

export default Home;

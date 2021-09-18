import React from "react";
import { MdAddShoppingCart } from "react-icons/md";
import { useCart } from "../../hooks/useCart";

import { Container } from "./styles";

interface CartItemsAmount {
  [key: number]: number;
}

interface ProductFormmatted {
  id: number;
  title: string;
  price: number;
  image: string;
  priceFormatted: string;
}

interface ProductItemProps {
  product: ProductFormmatted;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { cart, addProduct } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount;

    return sumAmount;
  }, {} as CartItemsAmount);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <Container key={product.id}>
      <img src={product.image} alt={product.title} />
      <strong>{product.title}</strong>
      <span>{product.priceFormatted}</span>
      <button
        type="button"
        data-testid="add-product-button"
        onClick={() => handleAddProduct(product.id)}
      >
        <div data-testid="cart-product-quantity">
          <MdAddShoppingCart size={16} color="#FFF" />
          {cartItemsAmount[product.id] || 0}
        </div>

        <span>ADICIONAR AO CARRINHO</span>
      </button>
    </Container>
  );
};

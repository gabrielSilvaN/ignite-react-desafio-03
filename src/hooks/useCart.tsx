import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const getCartFromLocalStorage = () => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  };

  const [cart, setCart] = useState<Product[]>(getCartFromLocalStorage());

  async function getProduct(productId: number) {
    const { data } = await api.get(`products/${productId}`);
    return data;
  }

  async function checkStock(productId: number) {
    const { data } = await api.get(`stock/${productId}`);
    return data;
  }

  const addProduct = async (productId: number) => {
    try {
      const stockOfProduct = await checkStock(productId);

      const productItem = cart.find((cartItem) => cartItem.id === productId);

      if (productItem) {
        if (!(productItem.amount + 1 <= stockOfProduct.amount)) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        const newCartState = cart.map((cartItem) => {
          if (cartItem.id === productId) {
            return {
              ...cartItem,
              amount: (cartItem.amount += 1),
            };
          }

          return cartItem;
        });

        setCart(newCartState);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCartState));
      } else {
        const product = await getProduct(productId);

        const dataToSave = [
          ...cart,
          {
            ...product,
            amount: 1,
          },
        ];

        setCart(dataToSave);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(dataToSave));
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productToDelete = cart.find(
        (cartItem) => cartItem.id === productId
      );

      if (!productToDelete) {
        toast.error("Erro na remoção do produto");
        return;
      }

      const dataToSave = cart.filter((cartItem) => cartItem.id !== productId);

      setCart(dataToSave);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(dataToSave));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) return;

      const stockOfProduct = await checkStock(productId);

      if (amount > stockOfProduct.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const dataToSave = cart.map((cartItem) => {
        if (cartItem.id === productId) {
          return {
            ...cartItem,
            amount: amount,
          };
        }

        return cartItem;
      });

      setCart(dataToSave);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(dataToSave));
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarketplace:cart');
      if(storageProducts){
        const productList: Product[] = JSON.parse(storageProducts);
        setProducts([...productList]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: any) => {
    const index = products.findIndex(p => p.id === product.id);
    if(index > -1) {
      products[index].quantity += 1;
      setProducts([...products])
    } else {
      product.quantity = 1;
      products.push(product)
      setProducts([...products]);
    }
    await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(products));

  }, [products]);

  const increment = useCallback(async id => {
    const index = products.findIndex(p=> p.id === id);
    products[index].quantity = ++products[index].quantity;
    setProducts([...products]);

    await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(products));
  }, [products]);

  const decrement = useCallback(async id => {
    const index = products.findIndex(p=> p.id === id);
    if(products[index].quantity !== 1) {
      products[index].quantity = --products[index].quantity;
      setProducts([...products]);
    }
    await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(products));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

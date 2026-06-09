import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CategoriesProvider } from './context/CategoriesContext';
import { ProductsProvider } from './context/ProductsContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import LookbookPage from './pages/LookbookPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <CategoriesProvider>
      <ProductsProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin has no header/footer */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Public shop pages */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/lookbook" element={<LookbookPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ProductsProvider>
    </CategoriesProvider>
  );
}

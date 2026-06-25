import { Link } from 'react-router-dom';
import { useCategories } from '../../context/CategoriesContext';
import { useProducts } from '../../context/ProductsContext';
import { categoryImageUrl } from '../../utils/categoryHelpers';

export default function CategoryGrid() {
  const { categoryList, loading, updatedAt } = useCategories();
  const { shopProducts } = useProducts();

  if (loading) {
    return <p className="collection-loading">Loading categories…</p>;
  }

  return (
    <div className="category-grid">
      {categoryList.map((cat) => {
        const count = shopProducts.filter((p) => p.category === cat.id).length;
        return (
          <Link key={cat.id} to={`/shop?cat=${cat.id}`} className="category-card">
            <img
              src={categoryImageUrl(cat.image, updatedAt)}
              alt={cat.label}
              className="category-card-img"
              loading="lazy"
            />
            <h3>{cat.label}</h3>
            <p>{count} items</p>
          </Link>
        );
      })}
    </div>
  );
}

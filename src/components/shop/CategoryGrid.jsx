import { Link } from 'react-router-dom';
import { useCategories } from '../../context/CategoriesContext';
import { useProducts } from '../../context/ProductsContext';

export default function CategoryGrid() {
  const { categoryList } = useCategories();
  const { shopProducts } = useProducts();

  return (
    <div className="category-grid">
      {categoryList.map((cat) => {
        const count = shopProducts.filter((p) => p.category === cat.id).length;
        return (
          <Link key={cat.id} to={`/shop?cat=${cat.id}`} className="category-card">
            <div
              className="category-card-img"
              style={{ backgroundImage: `url(${cat.image})` }}
            />
            <h3>{cat.label}</h3>
            <p>{count} items</p>
          </Link>
        );
      })}
    </div>
  );
}

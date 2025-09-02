import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

/**
 * Category Card Component - Individual category display card
 */
const CategoryCard = ({ category, className = "" }) => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    if (category._id) {
      navigate(`/category/${category._id}`);
    }
  };

  return (
    <div 
      onClick={handleCategoryClick}
      className={cn(
        "group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      {/* Category Image */}
      <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name || "Category"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback Icon */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            display: category.image ? 'none' : 'flex',
            color: 'var(--primary-color)'
          }}
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Category Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate transition-colors duration-200"
          onMouseEnter={(e) => {
            e.target.style.color = 'var(--primary-color)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'rgb(17, 24, 39)'; // text-gray-900
          }}
        >
          {category.name || "Category"}
        </h3>
        
        {category.productCount && (
          <p className="text-xs text-gray-500 mt-1">
            {category.productCount} products
          </p>
        )}
        
        {category.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;

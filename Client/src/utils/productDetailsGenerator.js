// Enhanced Product details generator for universal product types
// This utility generates relevant, dynamic product information for ALL types of goods

// Helper function to extract meaningful product attributes
const extractProductAttributes = (product) => {
  const name = product?.productName || product?.name || 'Premium Product';
  const brand = product?.brand || 'Quality Brand';
  const category = product?.category || 'General';
  const price = product?.price || product?.discountPrice || 0;
  const material = product?.material || product?.fabric || 'Premium Material';
  const color = product?.color || 'As Shown';
  const size = product?.size || [];
  const weight = product?.weight || 'Standard Weight';
  const dimensions = product?.dimensions || 'Standard Size';
  
  return {
    name, brand, category, price, material, color, size, weight, dimensions
  };
};

// Dynamic HTML content generator based on product type
const generateDynamicContent = (product, categoryType) => {
  const attrs = extractProductAttributes(product);
  
  const contentTemplates = {
    electronics: `
      <div class="product-description">
        <h3>About ${attrs.name}</h3>
        <p>Experience cutting-edge technology with the ${attrs.name} from ${attrs.brand}. This premium electronic device is designed to deliver exceptional performance and reliability for modern users.</p>
        
        <h4>Why Choose This Product?</h4>
        <ul>
          <li><strong>Advanced Technology:</strong> Latest features and innovations</li>
          <li><strong>User-Friendly:</strong> Intuitive interface and easy setup</li>
          <li><strong>Reliable Performance:</strong> Built for long-lasting use</li>
          <li><strong>Great Value:</strong> Premium quality at competitive price</li>
        </ul>
        
        <h4>Perfect For:</h4>
        <p>Professionals, students, tech enthusiasts, and anyone seeking reliable electronic solutions for daily use.</p>
      </div>
    `,
    
    fashion: `
      <div class="product-description">
        <h3>Style Meets Comfort</h3>
        <p>Discover the perfect blend of style and comfort with ${attrs.name}. Crafted from premium ${attrs.material}, this piece is designed to enhance your wardrobe with timeless appeal.</p>
        
        <h4>Style Features:</h4>
        <ul>
          <li><strong>Premium Fabric:</strong> High-quality ${attrs.material} for superior comfort</li>
          <li><strong>Versatile Design:</strong> Perfect for various occasions</li>
          <li><strong>Color Options:</strong> Available in ${attrs.color} and other variants</li>
          <li><strong>Perfect Fit:</strong> Multiple sizes available for ideal fit</li>
        </ul>
        
        <h4>Care Instructions:</h4>
        <p>Easy care fabric - machine wash cold, gentle cycle. Iron on low heat if needed. Hang dry for best results.</p>
      </div>
    `,
    
    home: `
      <div class="product-description">
        <h3>Transform Your Space</h3>
        <p>Enhance your home with ${attrs.name} - a perfect combination of functionality and aesthetic appeal. Designed to complement modern living spaces while providing practical solutions.</p>
        
        <h4>Home Benefits:</h4>
        <ul>
          <li><strong>Space Efficient:</strong> Optimized design for modern homes</li>
          <li><strong>Easy Maintenance:</strong> Simple to clean and maintain</li>
          <li><strong>Durable Build:</strong> Made from quality ${attrs.material}</li>
          <li><strong>Stylish Design:</strong> Complements any décor style</li>
        </ul>
        
        <h4>Installation & Use:</h4>
        <p>Simple setup process with clear instructions. No special tools required for most products. Ready to use in minutes.</p>
      </div>
    `,
    
    beauty: `
      <div class="product-description">
        <h3>Natural Beauty Enhancement</h3>
        <p>${attrs.name} is formulated with care to enhance your natural beauty. Our premium beauty products are designed for all skin types with gentle, effective ingredients.</p>
        
        <h4>Beauty Benefits:</h4>
        <ul>
          <li><strong>Gentle Formula:</strong> Safe for daily use on all skin types</li>
          <li><strong>Natural Ingredients:</strong> Carefully selected premium components</li>
          <li><strong>Proven Results:</strong> Clinically tested and dermatologist approved</li>
          <li><strong>Easy Application:</strong> Simple to use with visible results</li>
        </ul>
        
        <h4>How to Use:</h4>
        <p>Apply as directed on clean skin. For best results, use consistently as part of your daily beauty routine. Patch test recommended for sensitive skin.</p>
      </div>
    `,
    
    general: `
      <div class="product-description">
        <h3>Quality You Can Trust</h3>
        <p>${attrs.name} represents excellence in quality and value. Carefully crafted by ${attrs.brand}, this product is designed to meet your needs with reliable performance and lasting durability.</p>
        
        <h4>Key Advantages:</h4>
        <ul>
          <li><strong>Premium Quality:</strong> Made from high-grade ${attrs.material}</li>
          <li><strong>Reliable Performance:</strong> Tested for durability and functionality</li>
          <li><strong>Great Value:</strong> Best quality at competitive pricing</li>
          <li><strong>Customer Satisfaction:</strong> Backed by excellent customer service</li>
        </ul>
        
        <h4>Usage & Care:</h4>
        <p>Easy to use with minimal maintenance required. Follow included instructions for optimal performance and longevity.</p>
      </div>
    `
  };
  
  return contentTemplates[categoryType] || contentTemplates.general;
};

// Product details generator for various product categories
// This utility helps generate relevant product information for all types of goods

export const generateProductDetails = (product = {}, category = 'general') => {
  // Ensure category is a string
  const categoryString = typeof category === 'string' ? category : (category?.name || product?.category || 'general');
  const categoryLowerCase = categoryString.toLowerCase();

  // Base configurations for different product categories
  const categoryConfigs = {
    // Electronics & Technology
    electronics: {
      contents: [
        "1 x Main Device",
        "1 x Power Adapter/Charger", 
        "1 x USB Cable",
        "1 x User Manual",
        "1 x Warranty Card",
        "1 x Quick Start Guide",
        "Original Retail Box"
      ],
      specifications: {
        brand: product?.brand || "Premium Brand",
        model: product?.model || "Latest Model",
        color: product?.color || "Multiple Colors Available",
        warranty: "1-2 Years Manufacturer Warranty",
        connectivity: "USB, Bluetooth, Wi-Fi",
        powerSource: "AC Adapter / Battery",
        compatibility: "Universal Compatibility"
      },
      features: [
        "Latest Technology Integration",
        "Energy Efficient Design",
        "User-Friendly Interface",
        "Durable Build Quality",
        "Multi-Device Compatibility",
        "Fast Processing Speed",
        "Secure Data Protection",
        "24/7 Customer Support"
      ]
    },

    // Fashion & Apparel
    fashion: {
      contents: [
        "1 x Garment/Accessory",
        "1 x Care Instructions Card",
        "1 x Brand Authentication Tag",
        "1 x Size Guide",
        "Protective Packaging",
        "Original Brand Tags"
      ],
      specifications: {
        brand: product?.brand || "Fashion Brand",
        material: product?.material || "Premium Fabric/Material",
        color: product?.color || "As Shown in Image",
        care: "Machine/Hand Wash Safe",
        fit: "Regular/Slim/Loose Fit",
        origin: "Imported/Domestic",
        season: "All Season Wear"
      },
      features: [
        "Premium Quality Fabric",
        "Comfortable Fit & Feel",
        "Fade Resistant Colors",
        "Easy Care & Maintenance",
        "Breathable Material",
        "Durable Stitching",
        "Trendy & Stylish Design",
        "Size Chart Available"
      ]
    },

    // Home & Kitchen
    home: {
      contents: [
        "1 x Main Product",
        "1 x Assembly Instructions",
        "1 x Product Manual",
        "Required Hardware/Accessories",
        "1 x Warranty Information",
        "Care & Maintenance Guide",
        "Original Packaging"
      ],
      specifications: {
        brand: product?.brand || "Home Brand",
        material: product?.material || "High-Quality Material",
        dimensions: product?.dimensions || "Standard Size",
        weight: product?.weight || "Optimum Weight",
        capacity: "As Per Specifications",
        maintenance: "Easy to Clean",
        assembly: "Easy Assembly Required"
      },
      features: [
        "Space Efficient Design",
        "Easy Installation & Setup",
        "Durable Construction",
        "Multi-Purpose Usage",
        "Easy to Clean & Maintain",
        "Aesthetic Appeal",
        "Functional Design",
        "Long Lasting Performance"
      ]
    },

    // Beauty & Personal Care
    beauty: {
      contents: [
        "1 x Beauty Product",
        "1 x Usage Instructions",
        "1 x Ingredient List",
        "1 x Safety Guidelines",
        "1 x Authenticity Certificate",
        "Protective Packaging",
        "Original Seals"
      ],
      specifications: {
        brand: product?.brand || "Beauty Brand",
        type: "Personal Care Product",
        suitability: "All Skin/Hair Types",
        ingredients: "Natural & Safe Ingredients",
        shelf_life: "24-36 Months",
        certification: "Dermatologically Tested",
        cruelty_free: "Cruelty-Free Product"
      },
      features: [
        "Dermatologically Tested",
        "Natural & Safe Ingredients", 
        "Long Lasting Results",
        "Easy Application",
        "Suitable for Daily Use",
        "Non-Allergenic Formula",
        "Clinically Proven",
        "Premium Quality Assurance"
      ]
    },

    // Sports & Fitness
    sports: {
      contents: [
        "1 x Sports Equipment/Gear",
        "1 x Usage Manual",
        "1 x Safety Guidelines",
        "1 x Maintenance Guide",
        "1 x Warranty Card",
        "Protective Storage/Bag",
        "Original Packaging"
      ],
      specifications: {
        brand: product?.brand || "Sports Brand",
        material: product?.material || "High-Performance Material",
        size: "Multiple Sizes Available",
        weight: product?.weight || "Lightweight",
        durability: "Professional Grade",
        certification: "Quality Certified",
        usage: "Indoor/Outdoor Use"
      },
      features: [
        "Professional Quality",
        "Ergonomic Design",
        "Lightweight & Durable",
        "Enhanced Performance",
        "Weather Resistant",
        "Easy to Use & Store",
        "Safety Tested",
        "Long-Term Durability"
      ]
    },

    // Books & Media
    books: {
      contents: [
        "1 x Book/Media Item",
        "1 x Protective Packaging",
        "1 x Publisher Information",
        "1 x Authenticity Guarantee",
        "Original Publication",
        "Undamaged Condition"
      ],
      specifications: {
        author: product?.author || "Renowned Author",
        publisher: product?.publisher || "Premium Publisher",
        language: product?.language || "English/Hindi",
        pages: product?.pages || "Standard Pages",
        binding: "Paperback/Hardcover",
        edition: "Latest Edition",
        isbn: "Valid ISBN Number"
      },
      features: [
        "High Quality Print",
        "Clear & Readable Text",
        "Durable Paper Quality",
        "Professional Binding",
        "Educational Content",
        "Authentic Publication",
        "Easy to Read Format",
        "Long Lasting Pages"
      ]
    },

    // Automotive & Tools
    automotive: {
      contents: [
        "1 x Main Product/Tool",
        "1 x Installation Guide",
        "1 x User Manual",
        "Required Accessories",
        "1 x Warranty Information",
        "1 x Safety Instructions",
        "Original Packaging"
      ],
      specifications: {
        brand: product?.brand || "Automotive Brand",
        compatibility: "Universal/Specific Models",
        material: product?.material || "High-Grade Material",
        certification: "Quality Certified",
        installation: "Professional/DIY",
        warranty: "Manufacturer Warranty",
        origin: "Imported/Domestic"
      },
      features: [
        "High Performance Quality",
        "Durable Construction",
        "Easy Installation",
        "Universal Compatibility",
        "Weather Resistant",
        "Professional Grade",
        "Long Service Life",
        "Value for Money"
      ]
    },

    // General/Default
    general: {
      contents: [
        "1 x Product Unit",
        "1 x User Manual",
        "1 x Warranty Card", 
        "1 x Quality Certificate",
        "Protective Packaging",
        "Original Box"
      ],
      specifications: {
        brand: product?.brand || "Quality Brand",
        model: product?.model || "Standard Model",
        color: product?.color || "As Displayed",
        material: product?.material || "Premium Material",
        weight: product?.weight || "Standard Weight",
        dimensions: product?.dimensions || "Standard Size",
        warranty: "Manufacturer Warranty"
      },
      features: [
        "Premium Quality Material",
        "Durable Construction", 
        "Easy to Use",
        "Long Lasting Performance",
        "Value for Money",
        "Quality Assured",
        "Customer Satisfaction",
        "Reliable Performance"
      ]
    }
  };

  // Determine which category config to use
  let selectedConfig = categoryConfigs.general;
  let categoryType = 'general';

  // Check for category matches (including partial matches and common variations)
  const categoryMappings = {
    'electronic': 'electronics',
    'mobile': 'electronics',
    'laptop': 'electronics',
    'computer': 'electronics',
    'phone': 'electronics',
    'tablet': 'electronics',
    'headphone': 'electronics',
    'speaker': 'electronics',
    'watch': 'electronics',
    'camera': 'electronics',
    
    'clothing': 'fashion',
    'clothes': 'fashion',
    'shirt': 'fashion',
    'dress': 'fashion',
    'shoes': 'fashion',
    'bag': 'fashion',
    'accessory': 'fashion',
    'jewelry': 'fashion',
    'fashion': 'fashion',
    
    'kitchen': 'home',
    'furniture': 'home',
    'appliance': 'home',
    'decoration': 'home',
    'storage': 'home',
    'bedding': 'home',
    
    'cosmetic': 'beauty',
    'skincare': 'beauty',
    'makeup': 'beauty',
    'perfume': 'beauty',
    'haircare': 'beauty',
    
    'fitness': 'sports',
    'sport': 'sports',
    'exercise': 'sports',
    'outdoor': 'sports',
    'gym': 'sports',
    
    'book': 'books',
    'novel': 'books',
    'magazine': 'books',
    'education': 'books',
    
    'auto': 'automotive',
    'car': 'automotive',
    'bike': 'automotive',
    'tool': 'automotive',
    'motor': 'automotive'
  };

  // Find matching category
  for (const [key, value] of Object.entries(categoryMappings)) {
    if (categoryLowerCase.includes(key)) {
      selectedConfig = categoryConfigs[value];
      categoryType = value;
      break;
    }
  }

  // If direct category match exists, use it
  if (categoryConfigs[categoryLowerCase]) {
    selectedConfig = categoryConfigs[categoryLowerCase];
    categoryType = categoryLowerCase;
  }

  // Generate dynamic HTML content if none exists
  const dynamicHtmlContent = product?.productDetails || 
                            product?.htmlContent || 
                            generateDynamicContent(product, categoryType);

  // Merge with any existing product data and enhance with dynamic content
  return {
    contents: product?.contents || selectedConfig.contents,
    specifications: { 
      ...selectedConfig.specifications, 
      ...product?.specifications,
      // Add dynamic specifications based on actual product data
      ...(product?.brand && { brand: product.brand }),
      ...(product?.material && { material: product.material }),
      ...(product?.color && { color: product.color }),
      ...(product?.weight && { weight: product.weight }),
      ...(product?.dimensions && { dimensions: product.dimensions })
    },
    features: product?.features || selectedConfig.features,
    htmlContent: dynamicHtmlContent,
    video: product?.product_video || product?.video,
    categoryType: categoryType
  };
};

// Helper function to get category-specific delivery information
export const getCategoryDeliveryInfo = (category = 'general') => {
  // Ensure category is a string
  const categoryString = typeof category === 'string' ? category : (category?.name || 'general');
  const categoryLowerCase = categoryString.toLowerCase();
  
  const deliveryConfigs = {
    electronics: {
      specialHandling: "Fragile item - Special packaging",
      deliveryTime: "1-3 business days",
      restrictions: "Signature required on delivery"
    },
    fashion: {
      specialHandling: "Try & Buy available",
      deliveryTime: "2-5 business days", 
      restrictions: "Easy returns within 7 days"
    },
    beauty: {
      specialHandling: "Temperature controlled packaging",
      deliveryTime: "1-4 business days",
      restrictions: "Check expiry date on delivery"
    },
    books: {
      specialHandling: "Moisture-proof packaging",
      deliveryTime: "2-6 business days",
      restrictions: "Handle with care"
    },
    general: {
      specialHandling: "Standard secure packaging",
      deliveryTime: "2-5 business days",
      restrictions: "Standard delivery terms apply"
    }
  };

  return deliveryConfigs[categoryLowerCase] || deliveryConfigs.general;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { generateProductDetails, getCategoryDeliveryInfo };

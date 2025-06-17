// src/constants/productConfig.js

// تعريف الفئات وخصائصها (Attributes)
// هذه الخصائص هي الخصائص العادية للمنتج وليست Variations
export const CATEGORY_ATTRIBUTES = {
    electronics: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "processor", type: "text", label_en: "Processor", label_ar: "المعالج" },
        { key: "ram", type: "number", label_en: "RAM (GB)", label_ar: "الرام (جيجا بايت)" },
        { key: "screen_size", type: "number", label_en: "Screen Size (inches)", label_ar: "حجم الشاشة (بوصة)" },
    ],
    shoes: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "material", type: "text", label_en: "Material", label_ar: "الخامة" },
    ],
    clothes: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "material", type: "text", label_en: "Material", label_ar: "الخامة" },
    ],
    kitchens: [
        { key: "brand", type: "text", label_en: "Brand", label_ar: "الماركة" },
        { key: "material", type: "text", label_en: "Material", label_ar: "المادة المصنعة" },
        { key: "capacity", type: "text", label_en: "Capacity (e.g., 2L)", label_ar: "السعة (مثال: 2 لتر)" },
        { key: "power", type: "text", label_en: "Power (e.g., 1200W)", label_ar: "القدرة (مثال: 1200 واط)" },
    ],
    others: [ 
        { key: "material", type: "text", label_en: "Material", label_ar: "الخامة" },
        { key: "weight", type: "number", label_en: "Weight (kg)", label_ar: "الوزن (كيلوجرام)" },
    ]
};

// تحديد أنواع الـ Variations المتاحة لكل فئة (مثال: الألوان، المقاسات)
// هذه الخصائص هي التي يمكن أن يكون للمنتج منها Variations مختلفة
export const CATEGORY_VARIATIONS_OPTIONS_DEFINITION = {
    electronics: [
        { name_en: "Storage", name_ar: "التخزين", type: "text", display_type: "select" },
        { name_en: "Color", name_ar: "اللون", type: "text", display_type: "color" }, // **الألوان كدوائر للإلكترونيات**
        { name_en: "Size", name_ar: "المقاس", type: "number", display_type: "chip" }, // **المقاسات كـ chips للإلكترونيات**
    ],
    shoes: [
        { name_en: "Color", name_ar: "اللون", type: "text", display_type: "color" }, // **هذا سيجعل الألوان كدوائر للأحذية**
        { name_en: "Size", name_ar: "المقاس", type: "number", display_type: "chip" }, // **هذا سيجعل المقاسات كـ chips للأحذية**
    ],
    clothes: [
        { name_en: "Color", name_ar: "اللون", type: "text", display_type: "color" }, // **هذا سيجعل الألوان كدوائر للملابس**
        { name_en: "Size", name_ar: "المقاس", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL"], display_type: "chip" }, // **المقاسات كـ chips للملابس**
    ],
    kitchens: [
        { name_en: "Color", name_ar: "اللون", type: "text", display_type: "color" }, // **هذا سيجعل الألوان كدوائر للمطابخ**
        { name_en: "Material", name_ar: "المادة", type: "text", display_type: "select" },
    ],
    others: [
        { name_en: "Type", name_ar: "النوع", type: "text", display_type: "select" },
    ],
};

// قيم افتراضية للخصائص العادية (غير Variations)
export const DEFAULT_ATTRIBUTES_VALUES = {
    electronics: {
        brand: "TechBrand",
        processor: "Intel Core i7",
        ram: 16,
        screen_size: 15.6,
    },
    shoes: {
        brand: "SportyKicks",
        material: "Leather",
    },
    clothes: {
        brand: "FashionWear",
        material: "Cotton",
    },
    kitchens: {
        brand: "HomeChef",
        material: "Stainless Steel",
        capacity: "5L",
        power: "1000W",
    },
    others: {
        material: "Plastic",
        weight: 0.5,
    }
};
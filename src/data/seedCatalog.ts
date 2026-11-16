import { Category, Product } from '../types/store';

export const HERO_BANNER_IMAGE =
  '/src/assets/images/hero_couture_banner_1794830694014.jpg';

export const CAMPAIGN_BANNER_IMAGE =
  '/src/assets/images/campaign_pret_banner_1794830693262.jpg';

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'pret-silk',
    name: 'Pret Silk',
    slug: 'pret-silk',
    description: 'Tailored raw silk and breathable daily luxury silhouettes.',
    imageUrl: '/src/assets/images/product_ivory_silk_suit_1794830694822.jpg',
    sortOrder: 1,
  },
  {
    id: 'festive-couture',
    name: 'Festive Couture',
    slug: 'festive-couture',
    description: 'Copper-kissed evening embroidery and sheer organza drapes.',
    imageUrl: '/src/assets/images/product_copper_festive_ensemble_1794830694881.jpg',
    sortOrder: 2,
  },
  {
    id: 'contemporary-coords',
    name: 'Contemporary Co-ords',
    slug: 'contemporary-coords',
    description: 'Minimalist linen and jacquard two-piece ensembles.',
    imageUrl: '/src/assets/images/product_sand_linen_coord_1794830695714.jpg',
    sortOrder: 3,
  },
  {
    id: 'artisanal-shawls',
    name: 'Artisanal Shawls',
    slug: 'artisanal-shawls',
    description: 'Heritage woven shawls paired with structured winter tunics.',
    imageUrl: '/src/assets/images/product_espresso_velvet_shawl_1794830695916.jpg',
    sortOrder: 4,
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'lv-ivory-resham-silk',
    title: 'Noor Ivory Raw Silk 3-Piece',
    sku: 'LV-PS-101',
    category: 'Pret Silk',
    price: 8950,
    compareAtPrice: 10500,
    fabric: 'Pure Raw Silk & Organza Dupatta',
    description:
      'Finely tailored ivory raw silk kurta featuring champagne-copper resham threadwork along the neckline and hem, paired with straight cigarette trousers and a hand-finished organza dupatta.',
    imageUrl: '/src/assets/images/product_ivory_silk_suit_1794830694822.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
  },
  {
    id: 'lv-copper-festive-gown',
    title: 'Meher Rose-Copper Festive Gown',
    sku: 'LV-FC-204',
    category: 'Festive Couture',
    price: 14500,
    compareAtPrice: 16800,
    fabric: 'Crushed Tissue Silk & Zari Organza',
    description:
      'Signature LibasVibe brushed rose-copper silhouette embellished with antique bronze zari motifs, paired with a gossamer copper organza dupatta.',
    imageUrl: '/src/assets/images/product_copper_festive_ensemble_1794830694881.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
  },
  {
    id: 'lv-charcoal-damask-kurta',
    title: 'Shabnam Charcoal Damask Set',
    sku: 'LV-CC-302',
    category: 'Contemporary Co-ords',
    price: 6850,
    fabric: 'Woven Cotton Damask Jacquard',
    description:
      'Structured charcoal-black jacquard damask kurta accented with subtle bronze piping on the mandarin collar and placket, paired with tailored wide-leg trousers.',
    imageUrl: '/src/assets/images/product_charcoal_damask_kurta_1794830695096.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
  },
  {
    id: 'lv-sand-linen-coord',
    title: 'Sahra Sand Pleated Linen Co-ord',
    sku: 'LV-CC-309',
    category: 'Contemporary Co-ords',
    price: 5450,
    fabric: 'Breathable Belgian Linen Blend',
    description:
      'Effortless two-piece warm sand co-ord set finished with crisp knife-pleated cuffs, concealed button placket, and relaxed straight-cut trousers.',
    imageUrl: '/src/assets/images/product_sand_linen_coord_1794830695714.jpg',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    featured: true,
  },
  {
    id: 'lv-taupe-organza-kaftan',
    title: 'Zoya Mauve Organza Kaftan',
    sku: 'LV-FC-211',
    category: 'Festive Couture',
    price: 11200,
    compareAtPrice: 12900,
    fabric: 'Pure Silk Organza with Satin Slip',
    description:
      'Fluid evening kaftan in muted rose-taupe organza with hand-worked copper bead embroidery framing the neckline.',
    imageUrl: '/src/assets/images/product_blush_organza_kaftan_1794830696921.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
  },
  {
    id: 'lv-espresso-shawl-tunic',
    title: 'Farhan Heritage Espresso & Shawl Set',
    sku: 'LV-AS-405',
    category: 'Artisanal Shawls',
    price: 9800,
    fabric: 'Matte Silk Tunic & Woven Wool-Silk Shawl',
    description:
      'Deep espresso tailored tunic and trouser set elevated by an artisanal rose-gold bordered woven shawl.',
    imageUrl: '/src/assets/images/product_espresso_velvet_shawl_1794830695916.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
  },
];

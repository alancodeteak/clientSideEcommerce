/*
This file maps storefront catalog database rows into API response objects.
*/

import { toPublicMediaUrl } from "../../../infra/media/publicMediaUrl.js";

export function mapStorefrontCategoryRow(r) {
  const imageUrl = toPublicMediaUrl(r.image_storage_key);
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    parent_id: r.parent_id,
    sort_order: r.sort_order,
    image:
      r.image_storage_key != null
        ? {
            mediaAssetId: r.image_media_id,
            storageKey: r.image_storage_key,
            contentType: r.image_content_type,
            url: imageUrl
          }
        : null
  };
}

export function mapStorefrontProductRow(r) {
  const thumbUrl = toPublicMediaUrl(r.thumb_storage_key);
  const categoryImageUrl = toPublicMediaUrl(r.category_image_storage_key);
  let productImages = [];
  if (Array.isArray(r.product_images)) {
    productImages = r.product_images;
  } else if (typeof r.product_images === "string" && r.product_images.trim()) {
    try {
      const parsed = JSON.parse(r.product_images);
      productImages = Array.isArray(parsed) ? parsed : [];
    } catch {
      productImages = [];
    }
  }
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    price_minor_per_unit: r.price_minor_per_unit,
    offer_price_minor_per_unit: r.offer_price_minor_per_unit,
    availability: r.availability,
    unit: r.base_unit,
    thumbnail:
      r.thumb_storage_key != null
        ? {
            mediaAssetId: r.thumb_media_id,
            storageKey: r.thumb_storage_key,
            contentType: r.thumb_content_type,
            url: thumbUrl
          }
        : null,
    images: productImages.map((img) => ({
      mediaAssetId: img.media_asset_id,
      sortOrder: img.sort_order,
      storageKey: img.storage_key,
      contentType: img.content_type,
      url: toPublicMediaUrl(img.storage_key)
    })),
    category:
      r.category_slug != null
        ? {
            parent_id: r.category_parent_id,
            name: r.category_name,
            slug: r.category_slug,
            image:
              r.category_image_storage_key != null
                ? {
                    mediaAssetId: r.category_image_media_id,
                    storageKey: r.category_image_storage_key,
                    contentType: r.category_image_content_type,
                    url: categoryImageUrl
                  }
                : null
          }
        : null,
    created_at: r.created_at,
    category_id: r.category_id
  };
}

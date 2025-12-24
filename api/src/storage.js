import fetch from 'node-fetch';
import { supabaseAdmin } from './supabase.js';

export async function uploadImageFromUrl(productId, imageUrl) {
  if (!supabaseAdmin && !supabaseAdmin.storage) {
    throw new Error('Supabase not configured');
  }
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error('Failed to fetch image');
  const buf = await res.arrayBuffer();
  const path = `products/${productId}/${Date.now()}.jpg`;
  const { data, error } = await supabaseAdmin.storage.from('images').upload(path, Buffer.from(buf), { contentType: 'image/jpeg' });
  if (error) throw error;
  const publicUrl = supabaseAdmin.storage.from('images').getPublicUrl(path).data.publicUrl;
  return publicUrl;
}

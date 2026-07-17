import { createClient } from './supabase.js';

export async function logAdminAction(role, action, resource, details, req) {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('admin_logs').insert({
      user_role: role || 'admin',
      action,
      resource: resource || null,
      details: details || null,
      ip_address: req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || null,
    });
    if (error) console.error('Audit log error:', error.message);
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

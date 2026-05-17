import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createNoopQuery = () => {
	const query = {
		select: () => query,
		eq: () => query,
		limit: () => query,
		order: () => query,
		single: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
		insert: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
		update: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
		upsert: async () => ({ data: null, error: { message: 'Supabase is not configured.' } })
	};

	return query;
};

const createNoopSupabase = () => ({
	auth: {
		getSession: async () => ({ data: { session: null }, error: null }),
		onAuthStateChange: () => ({
			data: {
				subscription: {
					unsubscribe: () => {}
				}
			}
		}),
		signUp: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
		signInWithPassword: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
		signOut: async () => ({ error: { message: 'Supabase is not configured.' } })
	},
	from: () => createNoopQuery()
});

export const supabase = supabaseUrl && supabaseAnonKey
	? createClient(supabaseUrl, supabaseAnonKey)
	: createNoopSupabase();

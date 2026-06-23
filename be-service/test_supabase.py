from app.service.supabase import supabase

try:
    result = supabase.table("product").select("*").limit(1).execute()
    print("Connected!", result)
except Exception as e:
    print("Failed:", e)
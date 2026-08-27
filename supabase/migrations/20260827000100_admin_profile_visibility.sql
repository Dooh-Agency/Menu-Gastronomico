-- Restaurant administrators need to see their own team's profile metadata.
-- This does not expose profile data across tenants.
create policy "restaurant admins can read team profiles"
on public.profiles for select
using (
  restaurant_id is not null
  and restaurant_id = public.current_user_restaurant_id()
);

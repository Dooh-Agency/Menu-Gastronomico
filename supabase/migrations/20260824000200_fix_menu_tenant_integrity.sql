create or replace function public.enforce_menu_tenant_integrity() returns trigger language plpgsql as $$
declare
  category_restaurant_id uuid;
  daypart_restaurant_id uuid;
begin
  if tg_table_name = 'menu_categories' then
    if new.daypart_id is not null then
      select restaurant_id into daypart_restaurant_id from public.dayparts where id = new.daypart_id;
      if daypart_restaurant_id is distinct from new.restaurant_id then
        raise exception 'A daypart must belong to the same restaurant as its category';
      end if;
    end if;
  end if;

  if tg_table_name = 'menu_items' then
    select restaurant_id into category_restaurant_id from public.menu_categories where id = new.category_id;
    if category_restaurant_id is distinct from new.restaurant_id then
      raise exception 'A category must belong to the same restaurant as its menu item';
    end if;
  end if;
  return new;
end;
$$;

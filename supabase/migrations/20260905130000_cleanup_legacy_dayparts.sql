-- Clean up legacy demo dayparts that were created before the multi-menu system
delete from public.dayparts
where name in ('Diurna', 'Nocturna', 'Mostrador');

-- ============================================================================
-- STEPS SEGUROS · Endurecimiento de la firma de cotización (auditoría · menores)
-- Migración 0007
--  · Liga el cuerpo (línea, segmento, nombre, teléfono) al HMAC: una firma
--    capturada no puede reusarse con contenido distinto.
--  · Comparación constant-time (compara digests, no las cadenas crudas).
-- El servidor Node firma  hmac(secret, "<ts>|<tenant>|sha256(line\nseg\nname\nphone)>").
-- ============================================================================
create or replace function public.submit_quote_request(
  p_tenant_slug text, p_segment public.insurance_segment, p_insurance_line_slug text,
  p_contact_name text, p_contact_document text, p_contact_email text,
  p_contact_phone text, p_risk_payload jsonb, p_consent boolean,
  p_ts bigint, p_sig text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_tenant uuid; v_line uuid; v_agent uuid; v_id uuid;
  v_secret text; v_expected text; v_now bigint; v_body_hash text; v_message text;
begin
  select value into v_secret from public.app_config where key = 'quote_signing_secret';
  if v_secret is null or v_secret = '' then
    raise exception 'Servicio de cotización no configurado';
  end if;
  v_now := floor(extract(epoch from now()))::bigint;
  if p_ts is null or abs(v_now - p_ts) > 120 then
    raise exception 'Solicitud expirada. Recarga la página e intenta de nuevo.';
  end if;

  v_body_hash := encode(
    extensions.digest(
      coalesce(p_insurance_line_slug,'') || E'\n' || coalesce(p_segment::text,'') || E'\n' ||
      coalesce(p_contact_name,'') || E'\n' || coalesce(p_contact_phone,''),
      'sha256'
    ), 'hex');
  v_message := p_ts::text || '|' || p_tenant_slug || '|' || v_body_hash;
  v_expected := encode(extensions.hmac(v_message, v_secret, 'sha256'), 'hex');

  if p_sig is null
     or encode(extensions.digest(p_sig, 'sha256'), 'hex')
        <> encode(extensions.digest(v_expected, 'sha256'), 'hex') then
    raise exception 'Solicitud no autorizada.';
  end if;

  if p_consent is not true then
    raise exception 'Se requiere el consentimiento de tratamiento de datos (Ley 1581 de 2012)';
  end if;
  if coalesce(trim(p_contact_name), '') = '' then
    raise exception 'El nombre de contacto es obligatorio';
  end if;

  select id into v_tenant from public.tenants where slug = p_tenant_slug and is_active;
  if v_tenant is null then raise exception 'Tenant no encontrado o inactivo'; end if;

  select id into v_line from public.insurance_lines
    where tenant_id = v_tenant and slug = p_insurance_line_slug;

  select a.id into v_agent from public.agents a
    where a.tenant_id = v_tenant and a.is_accepting_leads
    order by a.active_leads_count asc, a.created_at asc
    limit 1;

  insert into public.quote_requests (
    tenant_id, insurance_line_id, segment, contact_name, contact_document,
    contact_email, contact_phone, risk_payload, consent_data_processing,
    consent_timestamp, status, source, assigned_agent_id
  ) values (
    v_tenant, v_line, p_segment, p_contact_name, p_contact_document,
    p_contact_email, p_contact_phone, coalesce(p_risk_payload, '{}'::jsonb), true,
    now(), 'nueva', 'web_form', v_agent
  ) returning id into v_id;

  if v_agent is not null then
    update public.agents set active_leads_count = active_leads_count + 1 where id = v_agent;
  end if;

  return v_id;
end;
$$;
revoke all on function public.submit_quote_request(text, public.insurance_segment, text, text, text, text, text, jsonb, boolean, bigint, text) from public;
grant execute on function public.submit_quote_request(text, public.insurance_segment, text, text, text, text, text, jsonb, boolean, bigint, text) to anon, authenticated;

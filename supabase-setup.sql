-- ============================================================
-- 蛋白质设计学习指南 · 会员与课程权益（邮箱注册登录）
-- 在 Supabase 控制台 → SQL Editor 里整体运行一次即可。
-- course 取值：binder / denovo / enzyme / bundle（三课合购）
-- ============================================================

-- 1) 兑换码池：code 为随机唯一码，一个码只能成功兑换一次
create table if not exists public.redemption_codes (
  code       text primary key,
  course     text not null check (course in ('binder','denovo','enzyme','bundle')),
  status     text not null default 'unused' check (status in ('unused','used')),
  used_by    uuid references auth.users (id) on delete set null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
alter table public.redemption_codes enable row level security;

-- 2) 课程权益：会员账号 ↔ 已购买课程（bundle 会自动拆成三门课权益）
create table if not exists public.entitlements (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  course     text not null check (course in ('binder','denovo','enzyme')),
  code       text not null,
  created_at timestamptz not null default now(),
  unique (user_id, course)
);
alter table public.entitlements enable row level security;

-- 会员只能看到自己的权益记录
drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own on public.entitlements
  for select using (auth.uid() = user_id);

-- 3) 兑换函数：由客户端 RPC 调用；原子地校验“未使用”并标记到当前登录用户
create or replace function public.redeem_code(p_course text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_found boolean := false;
begin
  if v_user is null then
    raise exception '请先登录';
  end if;

  update public.redemption_codes
     set status   = 'used',
         used_by  = v_user,
         used_at  = now()
   where lower(trim(p_code)) = code
     and course = p_course
     and status = 'unused'
   returning true into v_found;

  if v_found is not true then
    raise exception '兑换码不存在或已被使用';
  end if;

  -- bundle = 三门课一起解锁；其他只解锁一门课
  insert into public.entitlements (user_id, course, code)
  select v_user, c, lower(trim(p_code))
    from unnest(case when p_course = 'bundle'
                     then array['binder','denovo','enzyme']
                     else array[p_course] end) as c
  on conflict (user_id, course) do nothing;

  return jsonb_build_object('ok', true, 'user_id', v_user, 'course', p_course);
end;
$$;

-- 4) 只允许登录用户调用兑换函数；未登录调用会收到“请先登录”
revoke all on function public.redeem_code(text, text) from public;
grant execute on function public.redeem_code(text, text) to authenticated;

-- 5) 清理开发期自动测试产生的账号（只匹配我们自测用的邮箱前缀，可安全重复运行）
delete from public.entitlements
 where user_id in (select id from auth.users where email like 'pdg-selftest-%@example.com');
delete from auth.users where email like 'pdg-selftest-%@example.com';

-- 6) 可选：给现有未使用兑换码生成随机码的 SQL 由脚本提供，不要手工编短码
--    示例：insert into redemption_codes (code, course) values ('xxxxx', 'binder');

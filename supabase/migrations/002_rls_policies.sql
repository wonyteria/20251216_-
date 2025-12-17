-- =====================================================
-- 임풋(임foot) Row Level Security (RLS) 정책
-- =====================================================
-- 백엔드 서버 없이 Supabase만 사용하므로 RLS가 유일한 보안 레이어
-- 모든 데이터 접근/조작은 RLS를 통해 제어됨
-- =====================================================

-- =====================================================
-- 1. RLS 활성화 (모든 테이블)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_applies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_detail_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. 헬퍼 함수 (SECURITY DEFINER로 안전하게 실행)
-- =====================================================

-- 현재 사용자의 역할 조회
CREATE OR REPLACE FUNCTION get_my_roles()
RETURNS TEXT[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT COALESCE(roles, '{}') FROM users WHERE id = auth.uid();
$$;

-- 현재 사용자가 특정 역할을 가지고 있는지 확인
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND required_role = ANY(roles)
    );
$$;

-- super_admin 여부 확인
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT has_role('super_admin');
$$;

-- 특정 카테고리의 관리자인지 확인
CREATE OR REPLACE FUNCTION is_category_manager(cat category_type)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT is_super_admin() OR has_role(cat::TEXT || '_manager');
$$;

-- 아이템 작성자인지 확인
CREATE OR REPLACE FUNCTION is_item_owner(item_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM items
        WHERE id = item_id_param AND author_id = auth.uid()
    );
$$;

-- =====================================================
-- 3. users 테이블 정책
-- =====================================================
-- 주의: roles 필드는 super_admin만 수정 가능

-- 조회: 모든 사용자 공개
CREATE POLICY "users_select_public"
    ON users FOR SELECT
    USING (true);

-- 수정: 본인 프로필만 (단, roles 제외)
-- roles 수정 방지는 별도 트리거로 처리
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT/DELETE는 트리거로 처리되므로 일반 사용자 불가
-- (auth.users 트리거가 SECURITY DEFINER로 실행)

-- =====================================================
-- 4. users.roles 보호 트리거
-- =====================================================
-- 사용자가 자신의 roles를 수정하는 것을 방지

CREATE OR REPLACE FUNCTION protect_user_roles()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- super_admin이 아닌 사용자가 roles를 변경하려고 하면 차단
    IF NOT is_super_admin() AND OLD.roles IS DISTINCT FROM NEW.roles THEN
        RAISE EXCEPTION 'roles 필드는 관리자만 수정할 수 있습니다.';
    END IF;

    -- super_admin도 자기 자신의 super_admin 역할은 제거 불가 (락아웃 방지)
    IF auth.uid() = NEW.id
       AND 'super_admin' = ANY(OLD.roles)
       AND NOT ('super_admin' = ANY(NEW.roles)) THEN
        RAISE EXCEPTION '자신의 super_admin 권한은 제거할 수 없습니다.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_user_roles_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION protect_user_roles();

-- =====================================================
-- 5. items 테이블 정책
-- =====================================================
-- 주의: views, comments, current_participants, purchase_count는 직접 수정 불가

-- 조회: 모두 공개
CREATE POLICY "items_select_public"
    ON items FOR SELECT
    USING (true);

-- 생성: 인증된 사용자
CREATE POLICY "items_insert_authenticated"
    ON items FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND author_id = auth.uid()  -- 본인을 author로 설정해야 함
    );

-- 수정: 작성자 또는 카테고리 관리자
CREATE POLICY "items_update_owner_or_manager"
    ON items FOR UPDATE
    USING (
        author_id = auth.uid()
        OR is_category_manager(category_type)
    )
    WITH CHECK (
        author_id = auth.uid()
        OR is_category_manager(category_type)
    );

-- 삭제: 작성자 또는 카테고리 관리자
CREATE POLICY "items_delete_owner_or_manager"
    ON items FOR DELETE
    USING (
        author_id = auth.uid()
        OR is_category_manager(category_type)
    );

-- =====================================================
-- 6. items 보호 필드 트리거
-- =====================================================
-- views, comments, current_participants, purchase_count 직접 수정 방지

CREATE OR REPLACE FUNCTION protect_item_counters()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 관리자가 아닌 경우 카운터 필드 수정 방지
    IF NOT is_super_admin() THEN
        -- 카운터 필드들은 원래 값 유지
        NEW.views := OLD.views;
        NEW.comments := OLD.comments;
        NEW.current_participants := OLD.current_participants;
        NEW.purchase_count := OLD.purchase_count;
    END IF;

    -- author_id 변경 방지 (작성자 위조 방지)
    IF OLD.author_id IS DISTINCT FROM NEW.author_id THEN
        IF NOT is_super_admin() THEN
            NEW.author_id := OLD.author_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_item_counters_trigger
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION protect_item_counters();

-- =====================================================
-- 7. reviews 테이블 정책
-- =====================================================
-- 리뷰는 종료된(ended) 아이템에만 작성 가능

-- 조회: 모두 공개
CREATE POLICY "reviews_select_public"
    ON reviews FOR SELECT
    USING (true);

-- 생성: 종료된 아이템에 인증된 사용자만
CREATE POLICY "reviews_insert_authenticated"
    ON reviews FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()  -- 본인 ID로만 생성
        AND EXISTS (
            SELECT 1 FROM items
            WHERE items.id = item_id
            AND items.status = 'ended'
        )
    );

-- 수정: 본인 리뷰만
CREATE POLICY "reviews_update_own"
    ON reviews FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 삭제: 본인 또는 super_admin
CREATE POLICY "reviews_delete_own_or_admin"
    ON reviews FOR DELETE
    USING (user_id = auth.uid() OR is_super_admin());

-- =====================================================
-- 8. user_likes 테이블 정책
-- =====================================================

-- 조회: 본인 것만
CREATE POLICY "user_likes_select_own"
    ON user_likes FOR SELECT
    USING (user_id = auth.uid());

-- 생성: 본인 것만
CREATE POLICY "user_likes_insert_own"
    ON user_likes FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 삭제: 본인 것만
CREATE POLICY "user_likes_delete_own"
    ON user_likes FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- 9. user_applies 테이블 정책
-- =====================================================
-- 복잡한 권한: 본인 신청 + 아이템 작성자의 승인/거절

-- 조회: 본인 신청 또는 자신이 만든 아이템의 신청 목록
CREATE POLICY "user_applies_select"
    ON user_applies FOR SELECT
    USING (
        user_id = auth.uid()  -- 본인 신청
        OR is_item_owner(item_id)  -- 내 아이템에 대한 신청
        OR is_super_admin()
    );

-- 생성: 본인만, open 상태 아이템에만
CREATE POLICY "user_applies_insert_own"
    ON user_applies FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM items
            WHERE items.id = item_id
            AND items.status = 'open'
        )
    );

-- 수정: 본인은 cancelled만, 아이템 작성자는 approved/rejected만
CREATE POLICY "user_applies_update"
    ON user_applies FOR UPDATE
    USING (
        user_id = auth.uid()  -- 본인 신청
        OR is_item_owner(item_id)  -- 내 아이템
        OR is_super_admin()
    )
    WITH CHECK (
        -- 본인은 cancelled로만 변경 가능
        (user_id = auth.uid() AND status = 'cancelled')
        -- 아이템 작성자는 approved/rejected로 변경 가능
        OR (is_item_owner(item_id) AND status IN ('approved', 'rejected'))
        OR is_super_admin()
    );

-- 삭제: 불가 (기록 보존)
-- DELETE 정책 없음

-- =====================================================
-- 10. user_unlocks 테이블 정책
-- =====================================================

-- 조회: 본인 것만
CREATE POLICY "user_unlocks_select_own"
    ON user_unlocks FOR SELECT
    USING (user_id = auth.uid());

-- 생성: 본인만, 크루 리포트만
CREATE POLICY "user_unlocks_insert_own"
    ON user_unlocks FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM items
            WHERE items.id = item_id
            AND items.category_type = 'crew'
            AND items.crew_type = 'report'
        )
    );

-- 삭제: 불가 (구매 기록 보존)
-- DELETE 정책 없음

-- =====================================================
-- 11. transactions 테이블 정책 (매우 중요!)
-- =====================================================
-- 결제 기록은 생성만 가능, 수정/삭제 불가

-- 조회: 본인 것만 (관리자는 전체)
CREATE POLICY "transactions_select_own"
    ON transactions FOR SELECT
    USING (user_id = auth.uid() OR is_super_admin());

-- 생성: 본인만
CREATE POLICY "transactions_insert_own"
    ON transactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 수정: 불가 (불변성)
-- UPDATE 정책 없음 = 아무도 수정 불가

-- 삭제: 불가 (감사 추적)
-- DELETE 정책 없음 = 아무도 삭제 불가

-- =====================================================
-- 12. 콘텐츠 관리 테이블 (관리자 전용)
-- =====================================================

-- slides
CREATE POLICY "slides_select_public" ON slides FOR SELECT USING (true);
CREATE POLICY "slides_insert_admin" ON slides FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "slides_update_admin" ON slides FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "slides_delete_admin" ON slides FOR DELETE USING (is_super_admin());

-- notifications
CREATE POLICY "notifications_select_public" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "notifications_update_admin" ON notifications FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "notifications_delete_admin" ON notifications FOR DELETE USING (is_super_admin());

-- briefings
CREATE POLICY "briefings_select_public" ON briefings FOR SELECT USING (true);
CREATE POLICY "briefings_insert_admin" ON briefings FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "briefings_update_admin" ON briefings FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "briefings_delete_admin" ON briefings FOR DELETE USING (is_super_admin());

-- category_headers
CREATE POLICY "category_headers_select_public" ON category_headers FOR SELECT USING (true);
CREATE POLICY "category_headers_insert_admin" ON category_headers FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "category_headers_update_admin" ON category_headers FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "category_headers_delete_admin" ON category_headers FOR DELETE USING (is_super_admin());

-- category_detail_images
CREATE POLICY "category_detail_images_select_public" ON category_detail_images FOR SELECT USING (true);
CREATE POLICY "category_detail_images_insert_admin" ON category_detail_images FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "category_detail_images_update_admin" ON category_detail_images FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "category_detail_images_delete_admin" ON category_detail_images FOR DELETE USING (is_super_admin());

-- settings
CREATE POLICY "settings_select_public" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_admin" ON settings FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "settings_update_admin" ON settings FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "settings_delete_admin" ON settings FOR DELETE USING (is_super_admin());

-- =====================================================
-- 13. 유틸리티 함수 (클라이언트에서 사용)
-- =====================================================

-- 현재 사용자가 아이템에 좋아요 했는지 확인
CREATE OR REPLACE FUNCTION user_has_liked(item_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_likes
        WHERE user_id = auth.uid() AND item_id = item_id_param
    );
$$;

-- 현재 사용자가 아이템에 신청했는지 확인
CREATE OR REPLACE FUNCTION user_has_applied(item_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_applies
        WHERE user_id = auth.uid() AND item_id = item_id_param
        AND status != 'cancelled'
    );
$$;

-- 현재 사용자가 리포트를 구매했는지 확인
CREATE OR REPLACE FUNCTION user_has_unlocked(item_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_unlocks
        WHERE user_id = auth.uid() AND item_id = item_id_param
    );
$$;

-- 아이템 좋아요 수 조회
CREATE OR REPLACE FUNCTION get_item_likes_count(item_id_param BIGINT)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT COUNT(*)::INTEGER FROM user_likes WHERE item_id = item_id_param;
$$;

-- 아이템 신청자 수 조회
CREATE OR REPLACE FUNCTION get_item_applies_count(item_id_param BIGINT)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT COUNT(*)::INTEGER FROM user_applies
    WHERE item_id = item_id_param AND status IN ('applied', 'approved');
$$;

-- 내가 만든 아이템 조회
CREATE OR REPLACE FUNCTION get_my_items()
RETURNS SETOF items
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT * FROM items WHERE author_id = auth.uid() ORDER BY created_at DESC;
$$;

-- 좋아요 토글 (좋아요 추가/제거)
CREATE OR REPLACE FUNCTION toggle_like(item_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    liked BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION '로그인이 필요합니다.';
    END IF;

    -- 이미 좋아요 했는지 확인
    SELECT EXISTS (
        SELECT 1 FROM user_likes
        WHERE user_id = auth.uid() AND item_id = item_id_param
    ) INTO liked;

    IF liked THEN
        -- 좋아요 취소
        DELETE FROM user_likes WHERE user_id = auth.uid() AND item_id = item_id_param;
        RETURN FALSE;
    ELSE
        -- 좋아요 추가
        INSERT INTO user_likes (user_id, item_id) VALUES (auth.uid(), item_id_param);
        RETURN TRUE;
    END IF;
END;
$$;

-- =====================================================
-- 14. 뷰 카운트 증가 함수 (안전한 방식)
-- =====================================================

CREATE OR REPLACE FUNCTION increment_view_count(item_id_param BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE items SET views = views + 1 WHERE id = item_id_param;
END;
$$;

-- =====================================================
-- 15. 초기 super_admin 설정
-- =====================================================
-- 보안상 함수로 제공하지 않음
-- Supabase Dashboard > SQL Editor에서 직접 실행:
--
-- UPDATE users SET roles = array_append(roles, 'super_admin')
-- WHERE email = 'admin@example.com';
--
-- 또는 아래 함수를 일회성으로 사용 후 반드시 삭제할 것

-- =====================================================
-- 16. 보안 체크리스트 (주석)
-- =====================================================
/*
[필수 확인 사항]

1. Supabase Dashboard 설정
   - Authentication > Settings > Site URL 설정
   - Authentication > Settings > Redirect URLs 설정
   - API Settings > 불필요한 API 비활성화

2. 환경 변수
   - SUPABASE_URL은 공개해도 됨
   - SUPABASE_ANON_KEY는 공개해도 됨 (RLS가 보호)
   - SUPABASE_SERVICE_ROLE_KEY는 절대 노출 금지!

3. RLS 테스트
   - 모든 테이블에 RLS 활성화 확인
   - 로그아웃 상태에서 데이터 접근 테스트
   - 다른 사용자 데이터 접근 시도 테스트

4. 함수 보안
   - 모든 SECURITY DEFINER 함수에 SET search_path = public
   - 민감한 함수는 로그인 필수 체크

5. 정기 점검
   - 사용하지 않는 역할/정책 삭제
   - 비정상적인 트랜잭션 모니터링
   - 실패한 로그인 시도 모니터링

[테이블별 권한 요약]

| 테이블              | SELECT | INSERT | UPDATE | DELETE |
|---------------------|--------|--------|--------|--------|
| users               | 모두   | 트리거 | 본인   | 트리거 |
| items               | 모두   | 인증   | 작성자/관리자 | 작성자/관리자 |
| reviews             | 모두   | 인증(ended) | 본인 | 본인/관리자 |
| user_likes          | 본인   | 본인   | -      | 본인   |
| user_applies        | 본인/작성자 | 본인(open) | 제한적 | - |
| user_unlocks        | 본인   | 본인   | -      | -      |
| transactions        | 본인/관리자 | 본인 | -    | -      |
| slides~settings     | 모두   | 관리자 | 관리자 | 관리자 |

[보호되는 필드]
- users.roles: super_admin만 수정 가능
- items.views/comments/current_participants/purchase_count: 직접 수정 불가
- items.author_id: 생성 후 변경 불가
*/

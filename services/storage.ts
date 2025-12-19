
import { supabaseUpload } from './supabase';

/**
 * 전용 버킷에 파일을 업로드하고 공개 URL을 반환합니다.
 * @param bucket 버킷 이름 (예: 'images')
 * @param file 업로드할 파일 객체
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadImage(bucket: string, file: File): Promise<string | null> {
    try {
        // 파일명 중복 방지를 위해 타임스탬프와 랜덤 문자열 추가
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const path = fileName;

        const publicUrl = await supabaseUpload(bucket, path, file);
        return publicUrl;
    } catch (error) {
        console.error('Image upload failed:', error);
        return null;
    }
}

/**
 * 관리자 페이지에서 범용적으로 사용할 수 있는 업로드 함수
 */
export async function adminUpload(file: File): Promise<string | null> {
    // 기본적으로 'assets' 버킷을 사용한다고 가정 (없을 경우 Supabase 대시보드에서 생성 필요)
    return uploadImage('assets', file);
}

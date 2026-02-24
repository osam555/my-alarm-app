import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';

export async function getDownloadUrlFromGs(gsUrl) {
    try {
        const fileRef = ref(storage, gsUrl);
        const downloadUrl = await getDownloadURL(fileRef);
        return downloadUrl;
    } catch (error) {
        console.error(`[Firebase] URL 변환 실패 (${gsUrl}):`, error);
        throw error;
    }
}

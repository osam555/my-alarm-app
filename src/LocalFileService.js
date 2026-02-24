import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export async function pickAndSaveLocalAudio() {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: false,
        });
        if (result.canceled) return null;

        const pickedFile = result.assets[0];
        const originalUri = pickedFile.uri;
        const fileName = pickedFile.name || `local_audio_${Date.now()}.wav`;

        const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
            from: originalUri,
            to: permanentUri,
        });
        console.log(`로컬 오디오 복사 완료: ${permanentUri}`);
        return { uri: permanentUri, name: fileName };
    } catch (error) {
        console.error('로컬 파일 선택 및 복사 실패:', error);
        return null;
    }
}

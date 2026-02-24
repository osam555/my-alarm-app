import notifee, { TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDownloadUrlFromGs } from './FirebaseService';

export async function createUnifiedAlarm(hour, minute, alarmId, fileUrls) {
    try {
        const localFiles = [];
        const uniqueAlarmId = `alarm_${alarmId}`;

        for (let i = 0; i < fileUrls.length; i++) {
            const currentUrl = fileUrls[i];
            let finalLocalUri = '';

            if (currentUrl.startsWith('gs://')) {
                const fileName = `${uniqueAlarmId}_track_${i}.wav`;
                finalLocalUri = `${FileSystem.documentDirectory}${fileName}`;
                const fileInfo = await FileSystem.getInfoAsync(finalLocalUri);

                if (!fileInfo.exists) {
                    const downloadUrl = await getDownloadUrlFromGs(currentUrl);
                    await FileSystem.downloadAsync(downloadUrl, finalLocalUri);
                }
            } else if (currentUrl.startsWith('file://')) {
                finalLocalUri = currentUrl;
            } else if (currentUrl.startsWith('http')) {
                const fileName = `${uniqueAlarmId}_track_${i}.wav`;
                finalLocalUri = `${FileSystem.documentDirectory}${fileName}`;
                const fileInfo = await FileSystem.getInfoAsync(finalLocalUri);
                if (!fileInfo.exists) {
                    await FileSystem.downloadAsync(currentUrl, finalLocalUri);
                }
            }

            localFiles.push({
                id: `track_${i}`,
                url: finalLocalUri,
                title: i === 0 ? '기상 알람' : `팟캐스트 ${i}`,
            });
        }

        await AsyncStorage.setItem(`@alarm_data_${uniqueAlarmId}`, JSON.stringify({ files: localFiles }));

        const triggerDate = new Date();
        triggerDate.setHours(hour, minute, 0, 0);
        if (triggerDate.getTime() < Date.now()) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        let notificationConfig = {
            id: uniqueAlarmId,
            title: Platform.OS === 'ios' ? '기상 시간입니다! ☀️' : '알람 동작 중',
            body: Platform.OS === 'ios' ? '알람을 끄고 아침 팟캐스트를 들으려면 탭하세요.' : '팟캐스트를 재생합니다.',
        };

        if (Platform.OS === 'android') {
            const channelId = await notifee.createChannel({
                id: 'silent_alarm_channel',
                name: '무음 알람 채널',
                sound: 'default',
                vibration: false,
            });
            notificationConfig.android = { channelId, pressAction: { id: 'default' } };
        } else if (Platform.OS === 'ios') {
            notificationConfig.ios = { sound: 'wakeup-sound.wav', badgeCount: 1 };
        }

        const trigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerDate.getTime(),
            ...(Platform.OS === 'android' && { alarmManager: { allowWhileIdle: true } })
        };

        await notifee.createTriggerNotification(notificationConfig, trigger);
        console.log(`${Platform.OS} 알람 및 다운로드 완료!`);
        return true;
    } catch (error) {
        console.error('알람 설정 및 다운로드 실패:', error);
        return false;
    }
}

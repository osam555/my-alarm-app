import React, { useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AlarmSettingScreen from './src/AlarmSettingScreen';
import { createUnifiedAlarm } from './src/AlarmManager';
import { setupPlayer, playPodcast } from './src/TrackPlayerService';

let notifee = null;
if (Platform.OS !== 'web') {
    notifee = require('@notifee/react-native').default;
    const { EventType } = require('@notifee/react-native');

    if (Platform.OS === 'android') {
        notifee.onBackgroundEvent(async ({ type, detail }) => {
            if (type === EventType.DELIVERED && detail.notification?.id?.startsWith('alarm_')) {
                const alarmDataStr = await AsyncStorage.getItem(`@alarm_data_${detail.notification.id}`);
                if (alarmDataStr) {
                    const { files } = JSON.parse(alarmDataStr);
                    await setupPlayer();
                    await playPodcast(files);
                }
            }
        });
    }
}

export default function App() {
    useEffect(() => {
        async function init() {
            if (Platform.OS !== 'web' && notifee) {
                await notifee.requestPermission();
            }
            await setupPlayer();
        }
        init();

        if (Platform.OS !== 'web' && notifee) {
            const { EventType } = require('@notifee/react-native');

            const handleNotificationTap = async (notification) => {
                if (Platform.OS === 'ios' && notification?.id?.startsWith('alarm_')) {
                    console.log('[iOS] 알림 탭 감지. 재생 시작!');

                    const alarmDataStr = await AsyncStorage.getItem(`@alarm_data_${notification.id}`);
                    if (alarmDataStr) {
                        const { files } = JSON.parse(alarmDataStr);
                        await setupPlayer();
                        await playPodcast(files);
                        notifee.setBadgeCount(0);
                    }
                }
            };

            notifee.getInitialNotification().then(initialNotification => {
                if (initialNotification) handleNotificationTap(initialNotification.notification);
            });

            const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
                if (type === EventType.PRESS && detail.notification) {
                    handleNotificationTap(detail.notification);
                }
            });

            return () => unsubscribe();
        }
    }, []);

    const handleSaveAlarm = async (hour, minute, days, playlistUrls) => {
        if (Platform.OS === 'web') {
            Alert.alert('안내', '웹 환경에서는 백그라운드 푸시 알람이 지원되지 않아 즉시 재생으로 데모를 진행합니다.', [
                {
                    text: '재생 확인',
                    onPress: async () => {
                        const fileList = playlistUrls.map((url, i) => ({ url, id: i.toString() }));
                        await setupPlayer();
                        await playPodcast(fileList);
                    }
                }
            ]);
            return;
        }

        const success = await createUnifiedAlarm(hour, minute, 'custom_alarm', playlistUrls);
        if (success) {
            Alert.alert(
                '알람 설정 완료!',
                `${hour}시 ${minute}분 알람이 설정되었습니다.`
            );
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <AlarmSettingScreen onSaveAlarm={handleSaveAlarm} />
        </View>
    );
}

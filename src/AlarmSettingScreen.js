import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { pickAndSaveLocalAudio } from './LocalFileService';

// 웹 대응을 위한 간단한 타임피커 렌더러
const WebTimePicker = ({ date, onDateChange }) => {
    const handleTimeChange = (e) => {
        const timeValue = e.target.value;
        if (timeValue) {
            const [hours, minutes] = timeValue.split(':');
            const newDate = new Date(date);
            newDate.setHours(parseInt(hours, 10));
            newDate.setMinutes(parseInt(minutes, 10));
            onDateChange(newDate);
        }
    };

    const getFormattedTime = () => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <input
            type="time"
            value={getFormattedTime()}
            onChange={handleTimeChange}
            style={{
                fontSize: '1.5rem',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
            }}
        />
    );
};

const DAYS_OF_WEEK = [
    { id: 0, label: '일' },
    { id: 1, label: '월' },
    { id: 2, label: '화' },
    { id: 3, label: '수' },
    { id: 4, label: '목' },
    { id: 5, label: '금' },
    { id: 6, label: '토' },
];

export default function AlarmSettingScreen({ onSaveAlarm }) {
    const [date, setDate] = useState(new Date());
    const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
    const [playlistUrls, setPlaylistUrls] = useState([
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    ]);

    const toggleDay = (dayId) => {
        setSelectedDays((prevDays) => {
            if (prevDays.includes(dayId)) {
                return prevDays.filter(id => id !== dayId);
            } else {
                return [...prevDays, dayId].sort();
            }
        });
    };

    const handlePickLocalFile = async () => {
        const savedLocalFile = await pickAndSaveLocalAudio();
        if (savedLocalFile) {
            setPlaylistUrls(prevUrls => [...prevUrls, savedLocalFile.uri]);
            Alert.alert('파일 추가됨', `${savedLocalFile.name}이(가) 재생 목록에 추가되었습니다.`);
        }
    };

    const handleSave = () => {
        if (selectedDays.length === 0) {
            Alert.alert('알림', '최소 하루 이상의 요일을 선택해주세요.');
            return;
        }
        const hour = date.getHours();
        const minute = date.getMinutes();
        if (onSaveAlarm) {
            onSaveAlarm(hour, minute, selectedDays, playlistUrls);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>알람 시간 설정</Text>

            {/* ⏰ 위아래 스크롤 휠 타임피커 (Web & Native 대응) */}
            <View style={styles.pickerContainer}>
                {Platform.OS === 'web' ? (
                    <WebTimePicker date={date} onDateChange={setDate} />
                ) : (
                    <DatePicker
                        date={date}
                        onDateChange={setDate}
                        mode="time"
                        locale="ko-KR"
                        theme="light"
                        minuteInterval={1}
                    />
                )}
            </View>

            <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.id);
                    const textColor = day.id === 0 ? '#FF3B30' : day.id === 6 ? '#007AFF' : '#333';
                    return (
                        <TouchableOpacity
                            key={day.id}
                            style={[
                                styles.dayButton,
                                isSelected ? styles.dayButtonSelected : null,
                            ]}
                            onPress={() => toggleDay(day.id)}
                        >
                            <Text style={[
                                styles.dayText,
                                { color: isSelected ? '#FFF' : textColor },
                            ]}>
                                {day.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.playlistActionContainer}>
                <TouchableOpacity style={styles.playlistAction} onPress={handlePickLocalFile}>
                    <Text style={styles.actionText}>내 기기에서 오디오 파일 추가</Text>
                </TouchableOpacity>
                <Text style={{ marginTop: 10 }}>현재 추가된 파일: {playlistUrls.length} 개</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장하기</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        alignItems: 'center',
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    pickerContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 40,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        width: '100%',
        paddingHorizontal: 20,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    dayButtonSelected: {
        backgroundColor: '#34C759',
    },
    dayText: {
        fontSize: 16,
        fontWeight: '600',
    },
    playlistActionContainer: {
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playlistAction: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    actionText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 30,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

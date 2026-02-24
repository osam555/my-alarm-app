import { Audio } from 'expo-av';

let soundObject = null;
let currentPlaylist = [];
let currentIndex = 0;

export async function setupPlayer() {
    let isSetup = false;
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            interruptionModeIOS: 1, // DO_NOT_MIX
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: 1, // DO_NOT_MIX
            playThroughEarpieceAndroid: false
        });
        isSetup = true;
    } catch (err) {
        console.error('오디오 환경 설정 실패:', err);
    }
    return isSetup;
}

export async function addTracksAndPlay(files) {
    currentPlaylist = files;
    currentIndex = 0;
    await playCurrentTrack();
}

export async function playPodcast(files) {
    currentPlaylist = files;
    currentIndex = 0;
    await playCurrentTrack();
}

async function playCurrentTrack() {
    if (currentPlaylist.length === 0 || currentIndex >= currentPlaylist.length) {
        return;
    }

    try {
        if (soundObject) {
            await soundObject.unloadAsync();
        }

        // expo-av 에서는 로컬 파일이든 원격(http)이든 uri 속성을 통해 로드합니다.
        const fileToPlay = currentPlaylist[currentIndex];

        const { sound } = await Audio.Sound.createAsync(
            { uri: fileToPlay.url },
            { shouldPlay: true }
        );

        soundObject = sound;

        // 곡이 끝나면 다음 곡으로 넘어가는 이벤트 리스너 등록
        soundObject.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                playNextTrack();
            }
        });

    } catch (error) {
        console.error('트랙 재생 에러:', error);
    }
}

async function playNextTrack() {
    currentIndex++;
    if (currentIndex < currentPlaylist.length) {
        await playCurrentTrack();
    } else {
        console.log("플레이리스트 재생 완료");
    }
}

// expo-av 방식에서는 백그라운드 컨트롤러 이벤트 바인딩이 별도로 존재하지 않습니다.
export async function TrackPlayerPlaybackService() {
    // 사용되지 않음 (웹 대응 및 expo-av 기반으로 전환)
}

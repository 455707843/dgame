
import AudioPlayer from "./AudioPlayer";
import {CoreEventID} from "../CoreDefine";
import Core from "../Core";
import ITick from "../interface/ITick";

export default class AudioMgr
{
    private m_stAudioPlayer: AudioPlayer;                           //音频播放器
    private m_sMusicFile: string;
    constructor()
    {
        this.m_stAudioPlayer = new AudioPlayer();
        this.m_stAudioPlayer.Init();
        cc.audioEngine.setMaxWebAudioSize(300);
        Core.EventMgr.BindEvent(CoreEventID.SdkEvent.ON_HIDE,this.OnAudioInterruptionBeginHandler,this);
        Core.EventMgr.BindEvent(CoreEventID.SdkEvent.ON_SHOW,this.OnAudioInterruptionEndHandler,this);
        Core.EventMgr.BindEvent(CoreEventID.SdkEvent.AUDIO_INTERRUPTION_BEGIN,this.OnAudioInterruptionBeginHandler,this);
        Core.EventMgr.BindEvent(CoreEventID.SdkEvent.AUDIO_INTERRUPTION_END,this.OnAudioInterruptionEndHandler,this);
    }

    private OnAudioInterruptionBeginHandler(): void
    {
        this.Clear();
    }
    private OnAudioInterruptionEndHandler(): void
    {
        if(this.m_sMusicFile)
        {
            this.PlayMusic(this.m_sMusicFile);
        }
    }

    /**
     * 音效音量设置
     */
    public set SoundVolume(volume: number)
    {
        this.m_stAudioPlayer.SoundVolume = volume;
    }

    public get SoundVolume(): number
    {
        return this.m_stAudioPlayer.SoundVolume;
    }

    /**
     * 音乐音量设置
     */
    public set MusicVolume(volume: number)
    {
        this.m_stAudioPlayer.MusicVolume = volume;
    }

    public get MusicVolume(): number
    {
        return this.m_stAudioPlayer.MusicVolume;
    }

    /**
     * 设置音乐静音
     */
    public set MusicMute(value: boolean)
    {
        this.m_stAudioPlayer.MusicMute = value;
    }

    /**
     * 设置音效静音
     */
    public set SoundMute(value: boolean)
    {
        this.m_stAudioPlayer.SoundMute = value;
    }

    /**
     * 播放音乐
     * @param file 文件名
     */
    public PlayMusic(file: string): void
    {
        this.m_sMusicFile = file;
        this.m_stAudioPlayer.PlayMusic(file,true);
    }

    /**
     * 播放音效
     * @param file 
     */
    public PlaySound(file: string): void
    {
        this.m_stAudioPlayer.PlaySound(file);
    }

    //清空音效
    public Clear(): void
    {
        this.m_stAudioPlayer.ClearCache();
    }

    //暂停音效
    public PauseSound(): void
    {
        this.m_stAudioPlayer.PauseSound();
    }

    //恢复播放音效
    public ResumeSound(): void
    {
        this.m_stAudioPlayer.ResumeSound();
    }

    //停止音效
    public StopSound(): void
    {
        this.m_stAudioPlayer.StopSound();
    }

    //停止播放指定音效
    public StopSoundByUrl(url: string): void
    {
        let soundId: number = this.m_stAudioPlayer.GetSoundId(url);
        if(soundId >= 0)
        {
            this.m_stAudioPlayer.StopSoundById(soundId);
        }
    }

    //暂停音乐
    public PauseMusic(): void
    {
        this.m_stAudioPlayer.PauseMusic();
    }

    //恢复播放音乐
    public ResumeMusic(): void
    {
        this.m_stAudioPlayer.ResumeMusic();
    }

    //停止音乐
    public StopMusic(): void
    {
        this.m_sMusicFile = "";
        this.m_stAudioPlayer.StopMusic();
    }

    //暂停所有正在播放的音乐
    public PauseAll(): void
    {
        cc.audioEngine.pauseAll();
    }

    //重新播放之前所有暂停的音乐
    public ResumeAll(): void
    {
        cc.audioEngine.resumeAll();
    }
}

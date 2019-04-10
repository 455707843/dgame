import {ResStruct} from "../util/ResMgr";
import {Music,ResType} from "../CoreDefine";
import Core from "../Core";

export default class AudioPlayer
{
    private MAX_SINGLE_SOUND_INSTANCE = 24;                     //同一个音效最多拥有多少个实例
    private m_iMusicVolume: number;                             //背景音乐的音量(0 - 1) (全局)
    private m_iSoundVolume: number;                             //音效的音量(0 - 1) (全局)

    private m_iMusicID: number;                                 //当前正在播放的音乐ID
    private m_arrSoundID: number[];                             //音效ID数组 便于控制
    private m_mapNameSoundId: Map<string,number> = new Map<string,number>();

    private m_sCurrentMusicName: string;                        //当前播放的背景音乐
    private m_iDefaultSoundValue: number = 0.75;                //默认音效大小
    private m_iDefaultMusicValue: number = 0.5;                   //默认音乐大小
    constructor()
    {
        this.m_iMusicID = -1;
        this.m_arrSoundID = [];
    }

    //初始化,获取资源管理器和本地音量
    public Init(): void
    {
        let musicVolumeValue = cc.sys.localStorage.getItem(Music.MusicVolume);
        let soundVolumeValue = cc.sys.localStorage.getItem(Music.SoundVolume);

        this.MusicVolume = null != musicVolumeValue ? parseFloat(musicVolumeValue) : this.m_iDefaultMusicValue;
        this.SoundVolume = null != soundVolumeValue ? parseFloat(soundVolumeValue) : this.m_iDefaultSoundValue;

        // cc.log(this.MusicVolume);
        cc.audioEngine.setMaxAudioInstance(this.MAX_SINGLE_SOUND_INSTANCE);
    }

    /**
     * 设置音乐静音
     */
    public set MusicMute(value: boolean)
    {
        let volume: number = value ? 0 : this.m_iDefaultMusicValue;
        cc.sys.localStorage.setItem(Music.MusicVolume,volume);
        if(cc.audioEngine.getMusicVolume() != volume)
        {
            cc.audioEngine.setMusicVolume(volume);
            this.m_iMusicVolume = volume;
        }
        if(value)
        {
            cc.audioEngine.pauseMusic();
        }
        else
        {
            cc.audioEngine.resumeMusic();
            if(this.m_iMusicID < 0)
            {
                this.PlayMusic(this.m_sCurrentMusicName);
            }
        }
    }

    /**
     * 设置音效静音
     */
    public set SoundMute(value: boolean)
    {
        let volume: number = value ? 0 : this.m_iDefaultSoundValue;
        cc.sys.localStorage.setItem(Music.SoundVolume,volume);
        this.m_iSoundVolume = volume;
        if(cc.audioEngine.getEffectsVolume() != volume)
        {
            cc.audioEngine.setEffectsVolume(volume);
        }
        if(value)
        {
            cc.audioEngine.stopAllEffects();
        }
    }

    /**
     * 音乐音量设置[0-1]
     */
    public set MusicVolume(volume: number)
    {
        if(cc.audioEngine.getMusicVolume() != volume)
        {
            cc.audioEngine.setMusicVolume(volume);
            this.m_iMusicVolume = volume;
        }
    }

    public get MusicVolume(): number
    {
        return this.m_iMusicVolume;
    }
    /**
     * 音效音量设置[0-1]
     */
    public set SoundVolume(volume: number)
    {
        if(cc.audioEngine.getEffectsVolume() != volume)
        {
            cc.audioEngine.setEffectsVolume(volume);
            this.m_iSoundVolume = volume;
        }
    }

    public get SoundVolume(): number
    {
        return this.m_iSoundVolume;
    }

    /**
     * 播放背景音乐
     * @param file 文件名 
     * @param loop 是否循环
     */
    public PlayMusic(file: string,loop: boolean = true): void
    {
        if(this.m_sCurrentMusicName == file && this.m_iMusicID >= 0)
        {
            return;
        }
        let path = AudioPlayer.GetUrl(file,AudioType.Music);
        this.m_sCurrentMusicName = file;
        if(cc.audioEngine.getMusicVolume() == 0)
        {
            return;
        }

        Core.ResMgr.LoadRes(ResStruct.CreateRes(path,ResType.AudioClip),(res) =>
        {
            if(0 <= this.m_iMusicID)
            {
                this.StopMusic();
            }
            this.PlayClip(res,loop,AudioType.Music,file);
        });
    }

    /** 
     * 停止音乐
    */
    public StopMusic(): void
    {
        if(this.m_iMusicID < 0)
        {
            return;
        }
        cc.audioEngine.stop(this.m_iMusicID);
        this.m_iMusicID = -1;
    }

    //暂停背景音乐
    public PauseMusic(): void
    {
        if(this.m_iMusicID >= 0)
        {
            cc.audioEngine.pause(this.m_iMusicID);
        }
        return;
    }

    //恢复播放音乐
    public ResumeMusic(): void
    {
        if(this.m_iMusicID >= 0)
        {
            cc.audioEngine.resume(this.m_iMusicID);
        }
        return;
    }

    /**
     * 播放音效
     * @param file 音效名
     */
    public PlaySound(file: string): void
    {
        let path = AudioPlayer.GetUrl(file,AudioType.Sound);
        Core.ResMgr.LoadRes(ResStruct.CreateRes(path,ResType.AudioClip),(res) =>
        {
            this.PlayClip(res,false,AudioType.Sound,file);
        });
    }

    public StopSound(): void
    {
        this.m_arrSoundID.forEach((sid) =>
        {
            cc.audioEngine.stop(sid);
        });
        this.m_arrSoundID.length = 0;
    }

    public StopSoundById(id: number): void
    {
        for(let i: number = 0;i < this.m_arrSoundID.length;i++)
        {
            if(this.m_arrSoundID[i] == id)
            {
                cc.audioEngine.stop(id);
                this.m_arrSoundID.splice(i,1);
                break;
            }
        }
    }

    //暂停音效
    public PauseSound(): void
    {
        this.m_arrSoundID.forEach((sid) =>
        {
            cc.audioEngine.pause(sid);
        });
    }

    //恢复播放音效
    public ResumeSound(): void
    {
        this.m_arrSoundID.forEach((sid) =>
        {
            cc.audioEngine.resume(sid);
        });
    }

    private PlayClip(clip: cc.AudioClip,loop: boolean,type: AudioType,name: string): void
    {

        if(type == AudioType.Music)
        {
            if(cc.audioEngine.getMusicVolume() != this.m_iMusicVolume)
            {
                cc.audioEngine.setMusicVolume(this.m_iMusicVolume);
            }
            let mid = cc.audioEngine.playMusic(clip,loop);
            this.m_iMusicID = mid;
        }
        else if(type == AudioType.Sound)
        {
            if(cc.audioEngine.getEffectsVolume() != this.m_iSoundVolume)
            {
                cc.audioEngine.setEffectsVolume(this.m_iSoundVolume);
            }
            if(this.m_iSoundVolume <= 0)
            {
                return;
            }
            let sid = cc.audioEngine.playEffect(clip,loop);
            this.m_mapNameSoundId.set(name,sid);
            this.m_arrSoundID.push(sid);
            cc.audioEngine.setFinishCallback(sid,() =>
            {
                this.OnSoundFinished(sid);
            });
        }
    }

    //音效播放完成后删除音效
    private OnSoundFinished(aid: number)
    {
        let idIndex = this.m_arrSoundID.findIndex((sid) =>
        {
            return (sid == aid);
        });
        if(idIndex != -1)
        {
            this.m_arrSoundID.splice(idIndex,1);
        }
    }

    //暂停所有音乐
    public PauseAll(): void
    {
        cc.audioEngine.pauseAll();
    }

    //重新播放音乐
    public ResumeAll(): void
    {
        cc.audioEngine.resumeAll();
    }

    /**
     * 卸载音频缓存
     */
    public ClearCache(): void
    {
        this.m_sCurrentMusicName = "";
        this.m_mapNameSoundId.clear();
        this.m_iMusicID = -1;
        this.m_arrSoundID.length = 0;
        cc.audioEngine.uncacheAll();
    }

    //获取播放路径
    private static GetUrl(name: string,type: number = 0): string
    {
        if(type == AudioType.Music)
        {
            return ("/sound/music/" + name);
        }
        else
        {
            return ("/sound/sound/" + name);
        }
    }

    public GetSoundId(name: string): number
    {
        if(this.m_mapNameSoundId.has(name))
        {
            return this.m_mapNameSoundId.get(name);
        }
        return -1;
    }
}


//音频类型 Music音乐, Sound音效
enum AudioType 
{
    Music = 1,
    Sound = 2,
}

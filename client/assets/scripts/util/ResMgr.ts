import Core from "../Core";
import {ResType} from "../CoreDefine";
import {EventID} from "../event/EventMgr";
import {LogLevel} from "../log/LogMgr";
import ObjectPool from "./ObjectPool";
export default class ResMgr
{
    private m_arrRes: Map<ResType,Map<string,ResStruct>>;
    private m_mapLoadInfo: Map<ResType,Map<string,Array<Function>>>;
    private m_mapScenePreloadRes: Map<string,Array<ResStruct>>;
    private m_fnLoadScene: Function;

    /**正在主动加载的数量 */
    private m_iLoadingCnt: number = 0;

    public constructor()
    {
        this.m_arrRes = new Map<ResType,Map<string,ResStruct>>();
        this.m_mapLoadInfo = new Map<ResType,Map<string,Array<Function>>>();
        this.m_mapScenePreloadRes = new Map<string,Array<ResStruct>>();
        this.m_arrRes.set(ResType.AudioClip,new Map<string,ResStruct>());
        this.m_arrRes.set(ResType.Bitmap,new Map<string,ResStruct>());
        this.m_arrRes.set(ResType.Json,new Map<string,ResStruct>());
        this.m_arrRes.set(ResType.Prefab,new Map<string,ResStruct>());
        this.m_arrRes.set(ResType.Spine,new Map<string,ResStruct>());
        this.m_arrRes.set(ResType.Text,new Map<string,ResStruct>());
        this.m_mapLoadInfo.set(ResType.AudioClip,new Map<string,Array<Function>>());
        this.m_mapLoadInfo.set(ResType.Bitmap,new Map<string,Array<Function>>());
        this.m_mapLoadInfo.set(ResType.Json,new Map<string,Array<Function>>());
        this.m_mapLoadInfo.set(ResType.Prefab,new Map<string,Array<Function>>());
        this.m_mapLoadInfo.set(ResType.Spine,new Map<string,Array<Function>>());
        this.m_mapLoadInfo.set(ResType.Text,new Map<string,Array<Function>>());
    }

    public get IsLoading(): boolean
    {
        return this.m_iLoadingCnt > 0;
    }

    /**
     * 加载单个资源
     * @param resData 需要加载的资源
     * @param fnCallback 回调函数里会带上资源 
     * @param uiName 关闭UI时释放该资源
     */
    public LoadRes(resData: ResStruct,fnCallback: Function): void
    {
        if(!resData.m_sUrl)
        {
            return;
        }
        let type = resData.m_iResType;
        let url = resData.m_sUrl;
        this.m_arrRes.get(type).set(url,resData);

        //如果已经加载过的直接返回资源
        let retRes: ResStruct = this.m_arrRes.get(type).get(url);
        if(retRes && retRes.Data)
        {
            fnCallback(retRes.Data);
            return;
        }
        let arrCallback: Array<Function> = this.m_mapLoadInfo.get(type).get(url);
        if(arrCallback)
        {
            arrCallback.push(fnCallback);
        }
        else                                                                                                                                                              
        {
            arrCallback = new Array<Function>();
            this.m_mapLoadInfo.get(type).set(url,arrCallback);
            arrCallback.push(fnCallback);
            this.m_iLoadingCnt++;
            cc.loader.loadRes(url,-1 != url.search("http") ? "image" : this.GetResType(type),(err,resItem) =>
            {
                this.m_iLoadingCnt--;
                if(err || !resItem)
                {
                    console.error("LoadRes Error::url:" + url);
                    return;
                }
                this.m_arrRes.get(type).get(url).SetData(resItem,type);
                this.OnCompleteCallback(url,type);
            });
        }
    }

    /**
     * 批量加载资源
     * @param arrResStruct 加载队列
     * @param fnCallBack 加载回调函数，返回的数据类型是`Array<ResStruct>`
     */
    public LoadResArray(arrResStruct: Array<ResStruct>,fnCallBack?: Function): void
    {
        if(!arrResStruct.length)
        {
            if(fnCallBack)
            {
                fnCallBack([]);
            }
            return;
        }
        let iCallbackTime: number = 0
        let mapQueue: Map<ResType,Array<string>> = new Map<ResType,Array<string>>();
        let mapStatsCompleted: Map<ResType,number> = new Map<ResType,number>();
        let mapStatsTotal: Map<ResType,number> = new Map<ResType,number>();
        let arrResCompleted: Array<ResStruct> = new Array<ResStruct>();
        let arrQueue: Array<string>;
        for(let resData of arrResStruct)
        {
            let mapResByType: Map<string,ResStruct> = this.m_arrRes.get(resData.m_iResType);
            if(mapResByType.has(resData.m_sUrl) && mapResByType.get(resData.m_sUrl).Data)
            {
                arrResCompleted.push(mapResByType.get(resData.m_sUrl));
            }
            else
            {
                if(!mapQueue.has(resData.m_iResType))
                {
                    arrQueue = new Array<string>();
                    mapQueue.set(resData.m_iResType,arrQueue);
                }
                else
                {
                    arrQueue = mapQueue.get(resData.m_iResType);
                }
                iCallbackTime++;
                arrQueue.push(resData.m_sUrl);
                mapResByType.set(resData.m_sUrl,resData);
            }
        }

        if(iCallbackTime == 0)
        {
            if(fnCallBack)
            {
                fnCallBack(arrResCompleted);
            }
            return;
        }
        mapQueue.forEach((arrQueue,resType) =>
        {
            if(arrQueue.length == 0)
            {
                return;
            }
            this.m_iLoadingCnt++;
            cc.loader.loadResArray(arrQueue,this.GetResType(resType),
                (cnt,total,item) =>
                {
                    mapStatsCompleted.set(resType,cnt);
                    mapStatsTotal.set(resType,total)
                    let iCompletedCnt: number = 0;
                    let iTotalCnt: number = 0;
                    mapStatsCompleted.forEach(value =>
                    {
                        iCompletedCnt += value;
                    });
                    mapStatsTotal.forEach(value =>
                    {
                        iTotalCnt += value;
                    });
                    this.OnProgressCallback(iCompletedCnt,iTotalCnt);
                },
                (err,arrRes) =>
                {
                    this.m_iLoadingCnt--;
                    iCallbackTime--;
                    if(err || !arrRes)
                    {
                        Core.Log(err.message,LogLevel.Error);
                    }
                    for(let i: number = 0;i < arrRes.length;i++)
                    {
                        if(arrRes[i])
                        {
                            let url: string = arrQueue[i];
                            let res: ResStruct = this.m_arrRes.get(resType).get(url);
                            res.SetData(arrRes[i],resType);
                            arrResCompleted.push(res);
                        }
                    }
                    //只剩一次时回调
                    if(iCallbackTime == 0 && fnCallBack)
                    {
                        fnCallBack(arrResCompleted);
                    }
                });
        });
    }

    /**
     * 添加一个预加载资源到队列中
     * @param res 资源描述
     * @param sceneName 绑定的场景名
     */
    public AddLoadResByScene(res: ResStruct,sceneName: string): void
    {
        let arrRes: Array<ResStruct>;
        arrRes = this.m_mapScenePreloadRes.get(sceneName);
        if(!arrRes)
        {
            arrRes = new Array<ResStruct>();
            this.m_mapScenePreloadRes.set(sceneName,arrRes);
        }
        let isNew: boolean = true;
        arrRes.forEach(function(testRes)
        {
            if(testRes.m_sUrl == res.m_sUrl && testRes.m_iResType == res.m_iResType)
            {
                isNew = false;
                return;
            }
        })
        if(isNew)
        {
            arrRes.push(res);
        }
    }

    /**
     * 场景预加载单个文件
     * 该文件在切换场景前加载
     * @param arrResStruct 资源的描述
     * @param sceneName 绑定的场景名
     */
    public AddPreLoadResArrayByScene(arrResStruct: Array<ResStruct>,sceneName: string): void
    {
        let that = this;
        arrResStruct.forEach(function(res)
        {
            that.AddLoadResByScene(res,sceneName);
        });
    }

    /**
     * 加载进度回调
     * @param completedCount 
     * @param totalCount 
     */
    private OnProgressCallback(completedCount: number,totalCount: number)
    {
        Core.EventMgr.Emit(EventID.LoadProcessEvent.LoadProgress,[completedCount,totalCount]);
    }

    /**
     * 1、预加载场景
     * 2、加载预加载资源
     * 3、加载场景
     * @param sceneName 
     * @param fnCallback 
     */
    public LoadScene(sceneName: string,fnCallback: Function): void
    {
        this.m_fnLoadScene = fnCallback;
        this.PreloadSceneRes(sceneName);
    }

    public PreloadSceneRes(sceneName: string): void
    {
        //加载完场景后设置一下
        Core.EventMgr.Emit(EventID.LoadProcessEvent.LoadProgress,[1,1]);
        cc.director.preloadScene(sceneName);
        let arrResList: Array<ResStruct> = [];
        if(this.m_mapScenePreloadRes.has(sceneName))
        {

        }
        if(this.m_mapScenePreloadRes.has(sceneName) && this.m_mapScenePreloadRes.get(sceneName).length > 0)
        {
            let arrResList: Array<ResStruct> = this.m_mapScenePreloadRes.get(sceneName);
            if(arrResList.length > 0)
            {
                this.LoadResArray(arrResList,() =>
                {
                    this.OnLoadSceneComplete();
                });
            }
            else
            {
                this.OnLoadSceneComplete();
            }
        }
        else
        {
            this.OnLoadSceneComplete();
        }
    }

    //场景和场景需要的预加载资源都已加载完毕
    private OnLoadSceneComplete(): void
    {
        if(this.m_fnLoadScene)
        {
            this.m_fnLoadScene();
            this.m_fnLoadScene = null;
        }
    }

    /**资源加载回调 */
    private OnCompleteCallback(url: string,type: ResType): void
    {
        let arrCallback: Array<Function> = this.m_mapLoadInfo.get(type).get(url);
        if(arrCallback)
        {
            let res: any = this.m_arrRes.get(type).get(url).Data;
            arrCallback.forEach(fnCallback =>
            {
                fnCallback(res);
            });
            arrCallback.length = 0;
        }
    }

    private GetResType(type: ResType): any
    {
        switch(type)
        {
            case ResType.Spine:
                return sp.SkeletonData;
            case ResType.Bitmap:
                return cc.SpriteFrame;
            case ResType.Prefab:
                return cc.Prefab;
            case ResType.AudioClip:
                return cc.AudioClip;
            case ResType.Text:
                return cc.TextAsset;
            case ResType.Json:
                return cc.JsonAsset;
            default:
                throw new Error("Error! type Not Found! type:" + type);
        }
    }
}

/**
 * 资源描述
 */
export class ResStruct
{
    /**资源类型 */
    public m_iResType: ResType;
    /**资源路径 */
    public m_sUrl: string;
    /**返回的资源 */
    private m_stData: any;
    constructor()
    {
        this.m_sUrl = "";
    }

    public get Data(): any
    {
        return this.m_stData;
    }

    public SetData(data: any,type: ResType): void
    {
        switch(type)
        {
            case ResType.Bitmap:
                if(data instanceof cc.SpriteFrame)
                {
                    this.m_stData = data;
                }
                else
                {
                    this.m_stData = new cc.SpriteFrame(data);
                }
                break;
            case ResType.Text:
                this.m_stData = data.text;
                break;
            case ResType.Json:
                this.m_stData = data.json;
                break;
            default:
                this.m_stData = data;
                break;
        }
    }

    /**
     * 
     * @param url 路径
     * @param type `ResType`类型
     * @param auto 是否在场景切换时销毁，默认不销毁
     * @param isNetWork 是否从网络加载，如腾讯的头像
     */
    public static CreateRes(url: string,type: ResType = -1): ResStruct
    {
        let res: ResStruct = ObjectPool.CheckOut(ResStruct);
        res.m_stData = null;
        res.m_sUrl = url;
        if(type != -1)
        {
            res.m_iResType = type;
        }
        else if(0 == url.search(/prefabs/))
        {
            res.m_iResType = ResType.Prefab;
        }
        else if(0 == url.search(/textures/))
        {
            res.m_iResType = ResType.Bitmap;
        }
        else if(0 == url.search(/effect/))
        {
            res.m_iResType = ResType.Spine;
        }
        else
        {
            throw new Error("资源类型未知" + type + ",url:" + url);
        }
        return res;
    }
}


import Core from "../Core";
import {ResType} from "../CoreDefine";
import {EventID} from "../event/EventMgr";
import {LogLevel} from "../log/LogMgr";
import ObjectPool from "./ObjectPool";
export default class ResMgr
{
    private m_arrRes: Map<ResType,Map<string,ResStruct>>;
    private m_mapLoadInfo: Map<ResType,Map<string,Array<Function>>>;

    /**场景预加载资源,key：sceneName */
    private m_mapScenePreloadRes: Map<string,Array<ResStruct>>;
    /**场景后加载资源,key：sceneName */
    private m_mapSceneAfterloadRes: Map<string,Array<ResStruct>>;
    private m_fnLoadScene: Function;
    private m_setAutoRelease: Set<string>;

    /**正在主动加载的数量 */
    private m_iLoadingCnt: number = 0;

    public constructor()
    {
        this.m_arrRes = new Map<ResType,Map<string,ResStruct>>();
        this.m_mapLoadInfo = new Map<ResType,Map<string,Array<Function>>>();
        this.m_mapScenePreloadRes = new Map<string,Array<ResStruct>>();
        this.m_mapSceneAfterloadRes = new Map<string,Array<ResStruct>>();
        this.m_setAutoRelease = new Set<string>();
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
            //cc.log("资源路径错误:" + resData.m_sUrl);
            return;
        }
        let that = this;
        let type = resData.m_iResType;
        let url = resData.m_sUrl;
        let auto = resData.m_bAutoRelease;
        resData.Reset();

        if(!that.m_arrRes.get(type))
        {
            that.m_arrRes.set(type,new Map<string,ResStruct>());
            that.m_mapLoadInfo.set(type,new Map<string,Array<Function>>());
        }
        //如果已经加载过的直接返回资源
        let retRes: ResStruct = that.m_arrRes.get(type).get(url);
        if(retRes && retRes.Data)
        {
            fnCallback(retRes.Data);
            return;
        }
        let arrCallback: Array<Function> = that.m_mapLoadInfo.get(type).get(url);
        if(arrCallback)
        {
            arrCallback.push(fnCallback);
        }
        else                                                                                                                                                              
        {
            arrCallback = new Array<Function>();
            that.m_mapLoadInfo.get(type).set(url,arrCallback);
            arrCallback.push(fnCallback);
            if(-1 != url.search("http"))//isFromNetWork && -1 != url.search("http")
            {
                that.m_iLoadingCnt++;
                cc.loader.load({url: url,type: "image"},function(err,resItem)
                {
                    that.m_iLoadingCnt--;
                    if(err)
                    {
                        console.error("LoadRes Error::url:" + url);
                        return;
                    }
                    if(!resItem)
                    {
                        return;
                    }
                    let retRes: ResStruct = ObjectPool.CheckOut(ResStruct);
                    retRes.SetData(resItem,type);
                    retRes.m_sUrl = url;
                    retRes.m_bAutoRelease = auto;
                    retRes.m_iResType = type;

                    that.m_arrRes.get(type).set(url,retRes);
                    that.OnCompleteCallback(url,type);
                    that.m_setAutoRelease.delete(type + url);
                    cc.loader.setAutoReleaseRecursively(url,auto);
                    //资源引用
                });
            }
            else
            {
                that.m_iLoadingCnt++;
                cc.loader.loadRes(url,this.GetResType(type),function(err,resItem)
                {
                    that.m_iLoadingCnt--;
                    if(err)
                    {
                        console.error("LoadRes Error::url:" + url);
                        return;
                    }
                    if(!resItem)
                    {
                        //cc.log(url + " is Error URL! type:",type);
                        return;
                    }
                    let retRes: ResStruct = ObjectPool.CheckOut(ResStruct);
                    retRes.SetData(resItem,type);
                    retRes.m_sUrl = url;
                    retRes.m_bAutoRelease = auto;
                    retRes.m_iResType = type;
                    that.m_arrRes.get(type).set(url,retRes);
                    that.OnCompleteCallback(url,type);
                    that.m_setAutoRelease.delete(type + url);
                    cc.loader.setAutoReleaseRecursively(url,auto);
                });
            }
        }
    }

    /**
     * 批量加载资源
     * @param arrResStruct 加载队列
     * @param fnCallBack 加载回调函数，返回的数据类型是`Array<ResStruct>`
     */
    public LoadResArray(arrResStruct: Array<ResStruct>,fnCallBack?: Function,bCheckInResStruct: boolean = false): void
    {
        if(!arrResStruct.length)
        {
            if(fnCallBack)
            {
                fnCallBack([]);
            }
            return;
        }
        let that = this;
        let iCallbackTime: number = 0
        let mapQueue: Map<ResType,Array<string>> = new Map<ResType,Array<string>>();
        let mapStatsCompleted: Map<ResType,number> = new Map<ResType,number>();
        let mapStatsTotal: Map<ResType,number> = new Map<ResType,number>();
        let arrResCompleted: Array<ResStruct> = new Array<ResStruct>();
        let arrQueue: Array<string>;
        for(let resData of arrResStruct)
        {
            let mapResByType: Map<string,ResStruct> = this.m_arrRes.get(resData.m_iResType);
            if(!mapResByType)
            {
                mapResByType = new Map<string,ResStruct>()
                this.m_arrRes.set(resData.m_iResType,mapResByType);
                this.m_mapLoadInfo.set(resData.m_iResType,new Map<string,Array<Function>>());
            }
            if(mapResByType.has(resData.m_sUrl))
            {
                arrResCompleted.push(mapResByType.get(resData.m_sUrl));
            }
            else
            {
                if(!mapQueue.has(resData.m_iResType))
                {
                    arrQueue = new Array<string>();
                    mapQueue.set(resData.m_iResType,arrQueue);
                    iCallbackTime++;
                }
                else
                {
                    arrQueue = mapQueue.get(resData.m_iResType);
                }
                that.m_setAutoRelease.has(resData.m_iResType + resData.m_sUrl);
                arrQueue.push(resData.m_sUrl);
            }
            if(bCheckInResStruct)
            {
                resData.Reset();
            }
        }
        if(bCheckInResStruct)
        {
            arrResStruct.length = 0;
        }

        if(iCallbackTime == 0)
        {
            if(fnCallBack)
            {
                fnCallBack(arrResCompleted);
            }
            return;
        }
        mapQueue.forEach(function(arrQueue,resType)
        {
            if(arrQueue.length == 0)
            {
                return;
            }
            that.m_iLoadingCnt++;
            cc.loader.loadResArray(arrQueue,that.GetResType(resType),function(cnt,total,item)
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
                that.OnProgressCallback(iCompletedCnt,iTotalCnt);
            },
                function(err,arrRes)
                {
                    that.m_iLoadingCnt--;
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
                            if(that.m_setAutoRelease.has(resType + url))
                            {
                                that.m_setAutoRelease.delete(resType + url);
                                cc.loader.setAutoReleaseRecursively(url,true);
                            }
                            let res: ResStruct = ResStruct.CreateRes(url,resType);
                            res.SetData(arrRes[i],resType);
                            that.m_arrRes.get(resType).set(url,res);
                            arrResCompleted.push(res);
                        }
                        else
                        {
                            //cc.log(arrQueue[i] + " is Error URL! type:",resType);
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
     * 添加一个预加载资源到队列中
     * @param res 资源描述
     * @param sceneName 绑定的场景名
     */
    public AddAfterLoadResByScene(res: ResStruct,sceneName: string): void
    {
        let arrRes: Array<ResStruct>;
        arrRes = this.m_mapSceneAfterloadRes.get(sceneName);
        if(!arrRes)
        {
            arrRes = new Array<ResStruct>();
            this.m_mapSceneAfterloadRes.set(sceneName,arrRes);
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

    public AddAfterLoadResArrayByScene(arrResStruct: Array<ResStruct>,sceneName: string): void
    {
        let that = this;
        arrResStruct.forEach(function(res)
        {
            that.AddAfterLoadResByScene(res,sceneName);
        });
        arrResStruct.length = 0;
    }

    /**
     * 加载进度回调
     * @param completedCount 
     * @param totalCount 
     */
    private OnProgressCallback(completedCount: number,totalCount: number)
    {
        // cc.log("loading... ",completedCount,"/",totalCount);
        Core.EventMgr.Emit(EventID.LoadProcessEvent.LoadProgress,[completedCount,totalCount]);
    }

    /**
     * 释放资源
     * @param url 
     * @param type 
     */
    public Release(url: string,type: ResType)
    {
        let res = this.m_arrRes.get(type).get(url);
        if(res)
        {
            this.m_arrRes.get(type).delete(url);
            ObjectPool.CheckIn(res);
            this.m_mapLoadInfo.get(type).delete(url);
            // cc.log(url,"资源释放成功");
            let deps = cc.loader.getDependsRecursively(url);
            cc.loader.release(deps);
            cc.loader.releaseRes(url,this.GetResType(type));
        }
        else
        {
            // cc.log("资源已释放");
        }
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
        if(this.m_mapScenePreloadRes.has(sceneName))
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

    /**后加载，尽量较少后加载的量 */
    public AfterLoadSceneRes(sceneName: string): void
    {
        //加载完场景后设置一下
        if(this.m_mapSceneAfterloadRes.has(sceneName))
        {
            let arrResList: Array<ResStruct> = this.m_mapSceneAfterloadRes.get(sceneName);
            if(arrResList.length > 0)
            {
                this.LoadResArray(arrResList,null,true);
            }
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
    public m_iResType: ResType;
    public m_sUrl: string;
    public m_bAutoRelease: boolean;
    /**返回的资源 */
    private m_stData: any;
    public static m_iTotalCnt: number = 0;
    constructor()
    {
        this.m_bAutoRelease = false;
        this.m_sUrl = "";
        ResStruct.m_iTotalCnt++;
        if(ResStruct.m_iTotalCnt > 500 && ResStruct.m_iTotalCnt % 10 == 0)
        {
            //cc.log("ResStruct.m_iTotalCnt >100,当前数量：",ResStruct.m_iTotalCnt);
        }
    }

    public get Data(): any
    {
        return this.m_stData;
    }

    public Reset(): void
    {
        this.m_iResType = ResType.Bitmap;
        this.m_sUrl = "";
        this.m_bAutoRelease = false;
        this.m_stData = null;
        ObjectPool.CheckIn(this);
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
    public static CreateRes(url: string,type: ResType = -1,auto: boolean = false): ResStruct
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
        res.m_bAutoRelease = auto;
        return res;
    }
}


import CoreConfig from "../CoreConfig";

/**
 * Log
 * 日志系统
 */
export default class LogMgr
{
    private m_arrLogDetails: Array<LogDetail>;
    private m_stDebugNode: cc.Node;
    private m_iStartTime: number;
    constructor()
    {
        this.m_iStartTime = Date.now();
    }

    public Init(): void
    {
    }

    private OnLoadRes(prefab: cc.Prefab): void
    {
    }

    public Log(info: string,lv?: LogLevel): void
    {
        let time = Date.now() - this.m_iStartTime;

        console.log(time + "ms",info);
        if(!lv)
        {
            lv = LogLevel.Info;
        }
        if(!this.m_arrLogDetails)
        {
            this.m_arrLogDetails = new Array<LogDetail>();
        }
        this.m_arrLogDetails.push(new LogDetail(info,lv,time));
        if(CoreConfig.DEBUG && this.m_stDebugNode)
        {
        }
    }
}

export class CheckLogDetail
{
    public name: string;
    public lv: LogLevel;
    public data: any;
    public time: number;
    public constructor(name: string,lv: LogLevel,data: any,time: number)
    {
        this.name = name;
        this.lv = lv;
        this.data = data;
        this.time = time;
    }
}

export class LogDetail
{
    public info: string;
    public level: LogLevel;
    public time: number;
    public constructor(info: string,lv: LogLevel,time: number)
    {
        this.info = info;
        this.level = lv;
        this.time = time;
    }
}

/**
 * 日志等级
 */
export enum LogLevel
{
    Info = "info",
    Debug = "debug",
    Warning = "waring",
    Error = "error",
}
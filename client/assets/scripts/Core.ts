import EventMgr from "./event/EventMgr";
import LogMgr,{LogLevel} from "./log/LogMgr";
import ResMgr from "./util/ResMgr";
import {GameLogic} from "./game/GameLogic";

export default class Core
{
    private static m_stEventMgr: EventMgr;
    private static m_stLogMgr: LogMgr;
    private static m_stResMgr: ResMgr;
    private static m_stGame: GameLogic;

    public static Init()
    {
        Core.m_stEventMgr = new EventMgr();
        Core.m_stLogMgr = new LogMgr();
        Core.m_stGame = new GameLogic();
        Core.m_stGame.Init();
    }

    public static get EventMgr(): EventMgr
    {
        return Core.m_stEventMgr;
    }

    public static get ResMgr(): ResMgr
    {
        return Core.m_stResMgr;
    }

    public static get Game(): GameLogic
    {
        return this.m_stGame;
    }

    public static Log(msg: string,level: LogLevel): LogMgr
    {
        return Core.m_stLogMgr;
    }
}
import EventMgr from "./event/EventMgr";
import LogMgr,{LogLevel} from "./log/LogMgr";
import ResMgr from "./util/ResMgr";
import {GameLogic} from "./game/GameLogic";
import {BarrageMgr} from "./barrage/BarrageMgr";
import Ticker from "./tick/Ticker";

export default class Core
{
    private static m_stEventMgr: EventMgr;
    private static m_stLogMgr: LogMgr;
    private static m_stResMgr: ResMgr;
    private static m_stBarrageMgr: BarrageMgr;
    private static m_stTick: Ticker;
    private static m_stGame: GameLogic;

    public static Init(node: cc.Node)
    {
        Core.m_stEventMgr = new EventMgr();
        Core.m_stLogMgr = new LogMgr();
        Core.m_stBarrageMgr = new BarrageMgr();
        Core.m_stGame = new GameLogic();
        Core.m_stTick = new Ticker();

        Core.m_stGame.Init();
        Core.m_stBarrageMgr.Init(node.getChildByName("barrage"));
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

    public static get Ticker(): Ticker
    {
        return this.m_stTick;
    }

    public static Log(msg: string,level: LogLevel): LogMgr
    {
        return Core.m_stLogMgr;
    }

    public static Update(dt: number): void
    {
        this.m_stTick.Update(dt);
    }
}
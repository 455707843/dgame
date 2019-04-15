import {ITick} from "./ITick";
export default class Ticker
{
    private m_arrTickList: Array<ITick> = [];

    public AddTick(tick: ITick): void
    {
        if(this.m_arrTickList.indexOf(tick) >= 0)
        {
            return;
        }
        this.m_arrTickList.push(tick);
    }

    public RemoveTick(tick: ITick): void
    {
        let iIndex = this.m_arrTickList.indexOf(tick);
        let iLength = this.m_arrTickList.length;
        if(-1 == iIndex || iLength == 0)
        {
            return;
        }
        this.m_arrTickList[iIndex] = this.m_arrTickList[iLength - 1];
        this.m_arrTickList.length = iLength - 1;
    }

    public Update(dt: number): void 
    {
        for(let tick of this.m_arrTickList)
        {
            tick.Update(dt);
        }
    }
}



import Core from "../Core";
import {ITick} from "../tick/ITick";

export class BarrageMgr implements ITick
{
    private m_stNode: cc.Node;
    private m_arrMsg: Array<MsgData> = [];
    public Init(node: cc.Node): void
    {
        this.m_stNode = node;
        Core.Ticker.AddTick(this);
    }

    public Update(): void
    {
        if(this.m_arrMsg.length > 0)
        {
            let temp: cc.Node = new cc.Node;
            temp.addComponent(cc.Label);
            temp.getComponent(cc.Label).string = "klkdsjlkdjfglkfd";
            temp.parent = this.m_stNode;
            temp.runAction(cc.moveTo(10,-200,0));
        }
    }
}

class MsgData
{
    msg: string;
    type: number;
}